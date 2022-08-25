import keras
def get_model():
    Model = keras.Sequential([
        keras.layers.LSTM(80,input_shape=(122,1),
        activation='tanh',recurrent_activation='hard_sigmoid'),
        keras.layers.Dense(5,activation="softmax")
    ])

    Model.compile(optimizer='rmsprop',loss='categorical_crossentropy', metrics=['accuracy'], run_eagerly=True)

    return Model

