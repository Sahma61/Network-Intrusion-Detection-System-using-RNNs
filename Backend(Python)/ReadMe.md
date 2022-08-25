
# NIDS Analyzer

**NIDS Analyzer** is an intrusion detection and analysis system written in **Python(Backend)** and **React(Frontend)**. This tool helps in a posteriori analysis of network packets capturing and classifying packets using **RNNs**. It can be a great tool for analysis of network and traffic data.

# Components
The **NIDS Analyzer** has the following component:

 1. **Analyzer** (For Real-time classification and packet capture)
 2. **Web API** (to send data to Frontend upon request)
 3. **Sender**  (to simulate packet transfer)

## Requirements:

 - **Python3**
 - **mysql-connector-python**
 - **tensorflow, keras, numpy, pandas**
 - **MySQL server**
 - **flask**

## Instructions for running the Backend server
In order to test the NIDS Analyzer, follow the below steps:

 - Start the Analyzer using "python3 analyzer.py".
 - Start packet transfer by "python3 sender.py 127.0.0.1 8001"
 - Run the API to serve the website using "python3 API.py"
 - Open the website Frontend to check for received packets.

**Point to note**: It is assumed that the backend server and the Website frontend are present on the same machine. If not, the local request address used by the **flask API** could be mapped to some static web address using tunneling (A good tool for tunneling is **pktriot**; for more info look [Here](https://docs.packetriot.com/quickstart/) ).


## CONTRIBUTORS

 1. **SAHMA ANWAR(IIT2018074)**
 2. **MILIND KHATRI(IIT2018082)**
 3. **ONKAR TELANGE(IIT2018065)**



