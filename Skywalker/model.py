import mlflow
import mlflow.tensorflow
import tensorflow as tf
from send2trash import send2trash
import os

# mlflow.start_run()
# mlflow.end_run()
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10)
])
predictions = model(x_train[:1]).numpy()
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
# loss_fn(y_train[:1], predictions).numpy()
model.compile(optimizer='adam', loss=loss_fn, metrics=['accuracy'])

mlflow.set_tracking_uri('/Users/bachbui/works/cycai/cnext-working-dir/Skywalker/.mlflow')
mlflow.set_experiment('MNIST')

CHECKPOINT_DIR = os.path.join("logs", "checkpoints")
if os.path.exists(CHECKPOINT_DIR):
    send2trash(CHECKPOINT_DIR)
os.mkdir(CHECKPOINT_DIR)
cp_callback = tf.keras.callbacks.ModelCheckpoint(
    filepath=os.path.join(CHECKPOINT_DIR, "cnext_{epoch:d}.hdf5"),
    save_weights_only=False,
    verbose=1,
    save_best_only=False,
    save_freq='epoch'
)

mlflow.tensorflow.autolog()
with mlflow.start_run():
    model.fit(x_train, y_train, epochs=3, callbacks=[cp_callback])
    mlflow.log_artifacts(CHECKPOINT_DIR, 'checkpoints')

