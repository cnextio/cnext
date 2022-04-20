def get_label_error_indices_to_match_labelerrors_com():
    """This method will reproduce the label errors found on labelerrors.com and
    match (within a few percentage) the counts of label errors in Table 1 in the
    label errors paper: https://arxiv.org/abs/2103.14749
    
    While reproducibility is nice, some of these methods have been improved, and
    if you are not reproducing the results in the paper, we recommend using the
    latest version of `cleanlab.pruning.get_noise_indices()`

    Variations in method is due to the fact that this research was
    conducted over the span of years. All methods use variations of
    confident learning."""

    if dataset == 'imagenet_val_set':
        cj = cleanlab.latent_estimation.compute_confident_joint(
            s=labels, psx=pyx, calibrate=False, )
        num_errors = cj.sum() - cj.diagonal().sum()
    elif dataset == 'mnist_test_set':
        cj = cleanlab.latent_estimation.compute_confident_joint(
            s=labels, psx=pyx, calibrate=False, )
        label_errors_bool = cleanlab.pruning.get_noise_indices(
            s=labels, psx=pyx, confident_joint=cj, prune_method='prune_by_class',
        )
        num_errors = sum(label_errors_bool)
    elif dataset != 'audioset_eval_set':  # Audioset is special case: it is multi-label
        cj = cleanlab.latent_estimation.compute_confident_joint(
            s=labels, psx=pyx, calibrate=False, )
        num_errors = cleanlab.latent_estimation.num_label_errors(
            labels=labels, psx=pyx, confident_joint=cj, )
    
    if dataset == 'audioset_eval_set':  # Special case (multi-label) (TODO: update)
        label_error_indices = cleanlab.pruning.get_noise_indices(
            s=labels, psx=pyx, multi_label=True,
            sorted_index_method='self_confidence', )
        label_error_indices = label_error_indices[:307]
    else:
        prob_label = np.array([pyx[i, l] for i, l in enumerate(labels)])
        max_prob_not_label = np.array(
            [max(np.delete(pyx[i], l, -1)) for i, l in enumerate(labels)])
        normalized_margin = prob_label - max_prob_not_label
        label_error_indices = np.argsort(normalized_margin)[:num_errors]

    return label_error_indices