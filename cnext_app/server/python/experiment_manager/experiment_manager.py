import plotly.io as pio
import plotly.express as px
from libs.message import CommandType, ExperimentManagerCommand
from libs.message_handler import BaseMessageHandler
import plotly.graph_objects as go
from mlflow.tracking.client import MlflowClient
import mlflow.tensorflow
import mlflow
import os
import re
import traceback

import pandas
from libs import logs
from libs.message import Message, WebappEndpoint

log = logs.get_logger(__name__)
pio.renderers.default = "json"


def get_checkpoints(mlflowClient: MlflowClient, run_id):
    """Get the list of checkpoints from mlFlow repos

    Args:
        mlflowClient (MlflowClient): [description]
        run_id ([type]): [description]
    Returns:
        if there is a checkoint then return a dictionary of {index: checkpoint_path}, 
        where index is parsed from the number right after the string'cnext_' in the checkpoint name. 
        This index is associated with index of the metrics returned by MlflowClient.get_metric_history.
        else return None
    """
    checkpoints = None
    artifacts = mlflowClient.list_artifacts(run_id, 'checkpoints')
    if (len(artifacts) > 0):
        checkpoints = {}
        for ckpt in artifacts:
            res = re.search(r'(?<=cnext_)\d+', ckpt.path)
            if res:
                index = res.group(0)
                checkpoints[index] = ckpt.path
    return checkpoints


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)

    def _add_cnext_metadata(self, object, metadata):
        if type(object) == dict:
            object['_cnext_metadata'] = metadata
        elif type(object) == mlflow.entities.run_info.RunInfo:
            object._cnext_metadata = metadata
        else:
            raise TypeError(
                'object type has to be dict or object, got %s' % type(object))
        return object

    RUN_NAME_SHORTEN_LENGTH = 10

    def _get_cnext_run_name(self, mlFlowClient, run_id):
        run = mlFlowClient.get_run(run_id)
        if 'mlflow.runName' in run.data.tags:
            # add underscore prefix to make it consistent with other fileds on mlflow
            return run.data.tags['mlflow.runName']
        else:
            return run_id[:MessageHandler.RUN_NAME_SHORTEN_LENGTH]

    def _get_metric_plots(self, mlflowClient, run_ids):
        metrics_data = {}
        metrics_index = {}
        # run_ids = message.content['run_ids']
        for run_id in run_ids:
            run = mlflowClient.get_run(run_id)
            metric_keys = run.data.metrics.keys()
            for metric in metric_keys:
                metric_history = mlflowClient.get_metric_history(
                    run_id, metric)
                if metric not in metrics_data:
                    metrics_data[metric] = {}
                cnext_run_name = self._get_cnext_run_name(mlflowClient, run_id)
                ## use run cnext name format for column name #
                metrics_data[metric][cnext_run_name] = [
                    m.value for m in metric_history]
                metrics_index = {
                    'step': [m.step for m in metric_history],
                    'timestamp': [m.timestamp for m in metric_history]
                }
        result = {'plots': {}}
        for metric in metrics_data.keys():
            metrics_df = pandas.DataFrame(
                dict([(k, pandas.Series(v))
                      for k, v in metrics_data[metric].items()]),
                index=metrics_index['step']
            )
            # fig = px.line(metrics_df, markers=True)
            fig = go.Figure()
            for col in metrics_df.columns:
                fig.add_trace(go.Scatter(x=metrics_df.index,
                                         y=metrics_df[col], mode='markers+lines', name=col))
                # fig.add_trace(go.Scatter(x=metrics_df.index, y=metrics_df[col], mode='lines', name=col))
            fig.update_layout(
                xaxis_title="steps",
                yaxis_title=metric,
                legend_title="runs",
                font=dict(size=11)
            )
            result['plots'][metric] = fig.to_json()

        # Checkpoins are keyed using cnext run name. It would be better if we key it by the run id instead
        #  but since the trace name in the plot using name not id, we have to use name to make it consistent #
        checkpoints = {}
        name_to_run_ids = {}
        for run_id in run_ids:
            cnext_run_name = self._get_cnext_run_name(mlflowClient, run_id)
            checkpoints[cnext_run_name] = get_checkpoints(mlflowClient, run_id)
            name_to_run_ids[cnext_run_name] = run_id
        log.info(checkpoints)
        if len(checkpoints) > 0:
            self._add_cnext_metadata(
                result, {'checkpoints': checkpoints, 'name_to_run_ids': name_to_run_ids})

        log.info(result)
        return result

    def _get_list_experiments(self, mlflowClient, params):
        running_exp_id = None
        experiments = getattr(
            mlflowClient, ExperimentManagerCommand.list_experiments)(**params)

        ##
        # Identify the running experiment.
        # Since the API does not provide this functionality, use running run as the proxy for running experiments
        # A run is running if it's end_time is None. This might not work when there are multiple running runs
        # initiated from different context
        # #
        for exp in experiments:
            run_infos = mlflowClient.list_run_infos(exp.experiment_id)
            log.info(run_infos)
            if len(run_infos) > 0 and run_infos[0].status == 'RUNNING':
                running_exp_id = exp.experiment_id
                break
        return {'experiments': experiments, 'running_exp_id': running_exp_id}

    def _get_list_run_infos(self, mlflowClient, params):
        active_run_id = None
        run_infos = getattr(
            mlflowClient, ExperimentManagerCommand.list_run_infos)(**params)
        ##
        # Identify the running experiment.
        # Since the API does not provide this functionality, use running run as the proxy for running experiments
        # A run is running if it's end_time is None. This might not work when there are multiple running runs
        # initiated from different context
        # Note: cann't use mlflow.active_run().info.run_uuid here because this is a different python context with
        # that initiated the run. We can improve this by attach the active run id to the message from client.
        # #
        for run_info in run_infos:
            log.info(run_info)
            if run_info.status == 'RUNNING':
                active_run_id = run_info.run_id
                break

        # define run name according to the cnext rule
        for run_info in run_infos:
            self._add_cnext_metadata(
                run_info, {'run_name': self._get_cnext_run_name(mlflowClient, run_info.run_id)})
            # run_info._cnext_metadata = {'run_name': get_run_name(mlFlowClient, run_info.run_id)}
        return {'runs': run_infos, 'active_run_id': active_run_id}

    def _load_artifact_to_local(self, mlflowClient, params):
        local_dir = params['local_dir']
        run_id = params['run_id']
        artifact_path = params['artifact_path']
        if not os.path.exists(local_dir):
            os.mkdir(local_dir)
        local_path = mlflowClient.download_artifacts(
            run_id, artifact_path, local_dir)
        return {'local_path': local_path}

    def _get_runs_data(self, mlflow, params):
        experiment_id = params['experiment_id']
        filter_string = ''
        if 'filter_string' in params:
            filter_string = params['filter_string']
        runs = mlflow.search_runs([experiment_id], filter_string)
            
        run_ids = None
        if 'run_ids' in params:
            run_ids = params['run_ids']
        
        pass

    def _create_return_message(self, command_name, content, error=False):
        message = Message(**{'webapp_endpoint': WebappEndpoint.ExperimentManager,
                             'command_name': command_name})
        message.content = content
        message.error = error
        return message

    def handle_message(self, message):
        log.info('Handle ExperimentManager message: %s' % message)
        try:
            params = message.content
            result = None
            if message.type == CommandType.MLFLOW_CLIENT:
                mlflowClient: MlflowClient = mlflow.tracking.MlflowClient(
                    params['tracking_uri'])
                params.pop('tracking_uri')
                if message.command_name == ExperimentManagerCommand.list_experiments:
                    result = self._get_list_experiments(mlflowClient, params)
                elif message.command_name == ExperimentManagerCommand.list_run_infos:
                    result = self._get_list_run_infos(mlflowClient, params)                
                else:
                    result = getattr(
                        mlflowClient, message.command_name)(**params)
            elif message.type == CommandType.MFLOW:
                tracking_uri = params['tracking_uri']
                params.pop('tracking_uri')
                params['uri'] = tracking_uri
                result = getattr(
                    mlflow, message.command_name)(**params)
            elif message.type == CommandType.MLFLOW_OTHERS:
                mlflowClient: MlflowClient = mlflow.tracking.MlflowClient(
                    params['tracking_uri'])
                if message.command_name == ExperimentManagerCommand.get_metric_plots:
                    result = self._get_metric_plots(
                        mlflowClient, message.content['run_ids'])
                elif message.command_name == ExperimentManagerCommand.load_artifacts_to_local:
                    result = self._load_artifact_to_local(mlflowClient, params)
                elif message.command_name == ExperimentManagerCommand.get_runs_data:
                    result = self._get_runs_data(mlflowClient, params)
                
            if result:
                returned_message = self._create_return_message(
                    message.command_name, result)
                self._send_to_node(returned_message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name)
            self._send_to_node(error_message)
