from datetime import datetime
import mysql.connector
import pandas as pd
import socket
import json
import time
import keras
import numpy as np

from threading import Thread, Lock, Event


from utils import get_modified_df, path1, col_names
from model import get_model

lock = Lock()
event = Event()
MAX_BYTES = 65535
path = """/home/sahma61/PY_workspace/Deep-learning-for-intrusion-detection-using-Recurrent-Neural-network-RNN/my_model1"""


def scheduler(time_interval):
    print("Scheduler Started")
    prev_time = datetime.timestamp(datetime.now()) * 1000
    cur_time = prev_time
    event.wait()
    while True:
        cur_time = datetime.timestamp(datetime.now()) * 1000
        if cur_time >= prev_time + time_interval:
            data = fetch_latest_entries(prev_time+1, cur_time)
            if data:
                df = predict(data)
                data = []
                for index, row in df.iterrows():
                    data.append(tuple(row))
                with lock:
                    put_latest_entries("world.NSLKDD", data, 44)
                prev_time = cur_time
        time.sleep(time_interval//1000-1)


def receiver(commit_interval):
    print("Receiver Started")
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    for i in range(8001, 9000):
        try:
            sock.bind(('127.0.0.1', i))
        except OSError:
            continue
    sock.settimeout(None)

    prev_time = int(datetime.timestamp(datetime.now()) * 1000)
    cur_time = prev_time

    commit_list = []
    while True:
        print('Listening at {}'.format(sock.getsockname()))
        data, recv_address = sock.recvfrom(MAX_BYTES)
        data = json.loads(data.decode())
        print(data)
        cur_time = int(datetime.timestamp(datetime.now()) * 1000)
        data.append(cur_time)
        data = tuple(data)
        commit_list.append(data)
        print(cur_time, prev_time, commit_interval)
        if cur_time >= prev_time + commit_interval and commit_list:
            print("start committing...")
            with lock:
                put_latest_entries("world.test", commit_list, 43)
            event.set()
            commit_list = []
            prev_time = cur_time
        time.sleep(1)


def fetch_latest_entries(t1, t2):
    db = mysql.connector.connect(option_files="/home/sahma61/connector.cnf")
    print("Connection id: {0}".format(db.connection_id))
    cursor = db.cursor(dictionary=True)
    prepared_statement = """SELECT * FROM world.test WHERE"""
    if t2 > t1:
        prepared_statement += """ arrivalTime >= {0} AND arrivalTime <= {1}""".format(t1, t2)
    else:
        return []
    cursor.execute(prepared_statement)
    result = cursor.fetchall()
    print(result)
    cursor.close()
    db.close()
    return result


def put_latest_entries(table, lst, length):
    db = mysql.connector.connect(option_files="/home/sahma61/connector.cnf")
    print("Connection id: {0}".format(db.connection_id))
    cursor = db.cursor()
    params = tuple(lst)

    print(params)
    prepared_statement = """INSERT INTO {0} VALUES""".format(table)
    prepared_statement += """(%s"""
    for i in range(length-1):
        prepared_statement += """, %s"""
    prepared_statement += """)"""
    print(prepared_statement)
    cursor.executemany(prepared_statement, params)
    print("Row Count = {0}".format(cursor.rowcount))
    print("Last Statement = {0}".format(cursor.statement))
    db.commit()
    cursor.close()
    db.close()


def predict(data):
    model = get_model()
    model = keras.models.load_model(path)

    df = pd.read_csv(path1,header=None, names = col_names)
    print('Dimensions of the Training set:',df.shape)
    df_test = pd.DataFrame.from_records(data, columns=col_names)
    # df_test =  df_test.drop('arrivalTime', axis=1)
    print(df_test)
    df = get_modified_df(df, df_test)
    df = np.asarray(df).astype(np.float32)
    result = model.predict(df)
    predicted_label = []
    for row in result:
        predicted_label.append(np.argmax(row, axis=-1))
    df = pd.DataFrame.from_records(data)
    print(predicted_label)
    df["predicted_label"] = predicted_label
    return df


def main():
    receiver_thread = Thread(target=receiver, args=(30000, ))
    scheduler_thread = Thread(target=scheduler, args=(60000, ))
    receiver_thread.start()
    scheduler_thread.start()

 
if __name__ == "__main__":
    main()
