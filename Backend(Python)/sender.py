import csv
import time
import socket
import sys
import json

path = """/home/sahma61/PY_workspace/Deep-learning-for-intrusion-detection-using-Recurrent-Neural-network-RNN/NSL_KDD_Test.csv"""

def sender(addr, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    for i in range(8001, 9000):
        try:
            sock.bind(('127.0.0.1', i))
        except OSError:
            continue
    sock.settimeout(None)
    
    file =  open(path, 'r')
    data_reader = csv.reader(file, delimiter=',')
        
    while True:
        print('Active on {}'.format(sock.getsockname()))
        data = next(data_reader)
        print(data)
        data = json.dumps(data).encode()
        sock.sendto(data, (addr, port))
        time.sleep(15)

def main():
    sender(sys.argv[1], int(sys.argv[2]))

if __name__ == "__main__":
    main()
