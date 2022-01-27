from mlflow.tracking.client import MlflowClient
import re

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
    if (len(artifacts)>0):
        checkpoints = {}
        for ckpt in artifacts:
            res = re.search(r'(?<=cnext_)\d+', ckpt.path)
            if res:
                index = res.group(0)
                checkpoints[index] = ckpt.path
    return checkpoints