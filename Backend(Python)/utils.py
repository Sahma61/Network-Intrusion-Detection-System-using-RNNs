# import libraries
import pandas as pd
import numpy as np
import sys
import sklearn
import io
import random
from sklearn.preprocessing import LabelEncoder,OneHotEncoder

from sklearn.preprocessing import LabelEncoder,OneHotEncoder

from sklearn.preprocessing import LabelEncoder,OneHotEncoder

def get_modified_df(df, df_test):
    categorical_columns=['protocol_type', 'service', 'flag']
    df_categorical_values = df[categorical_columns]
    testdf_categorical_values = df_test[categorical_columns]
    
    # protocol type
    unique_protocol=sorted(df.protocol_type.unique())
    string1 = 'Protocol_type_'
    unique_protocol2=[string1 + x for x in unique_protocol]
    print(unique_protocol2)

    # service
    unique_service=sorted(df.service.unique())
    string2 = 'service_'
    unique_service2=[string2 + x for x in unique_service]
    print(unique_service2)


    # flag
    unique_flag=sorted(df.flag.unique())
    string3 = 'flag_'
    unique_flag2=[string3 + x for x in unique_flag]
    print(unique_flag2)


    # put together
    dumcols=unique_protocol2 + unique_service2 + unique_flag2


    #do it for test set
    
    # protocol type
    unique_protocol_test=sorted(df_test.protocol_type.unique())
    unique_protocol2_test=[string1 + x for x in unique_protocol_test]
    
    # flag
    unique_flag_test=sorted(df_test.flag.unique())
    unique_flag2_test=[string3 + x for x in unique_flag_test]
    
    unique_service_test=sorted(df_test.service.unique())
    unique_service2_test=[string2 + x for x in unique_service_test]
    
    testdumcols=unique_protocol2_test + unique_service2_test + unique_flag2_test
    
    df_categorical_values_enc=df_categorical_values.apply(LabelEncoder().fit_transform)
    testdf_categorical_values_enc=testdf_categorical_values.apply(LabelEncoder().fit_transform)
    
    enc = OneHotEncoder(categories='auto')
    df_categorical_values_encenc = enc.fit_transform(df_categorical_values_enc)
    df_cat_data = pd.DataFrame(df_categorical_values_encenc.toarray(),columns=dumcols)
    
    testdf_categorical_values_encenc = enc.fit_transform(testdf_categorical_values_enc)
    testdf_cat_data = pd.DataFrame(testdf_categorical_values_encenc.toarray(),columns=testdumcols)
    
    trainservice=df['service'].tolist()
    testservice= df_test['service'].tolist()
    difference=list(set(trainservice) - set(testservice))
    string = 'service_'
    difference=[string + x for x in difference]

    for col in difference:
        testdf_cat_data[col] = 0
        
    newdf=df.join(df_cat_data)
    newdf.drop('flag', axis=1, inplace=True)
    newdf.drop('protocol_type', axis=1, inplace=True)
    newdf.drop('service', axis=1, inplace=True)

    newdf_test=df_test.join(testdf_cat_data)
    newdf_test.drop('flag', axis=1, inplace=True)
    newdf_test.drop('protocol_type', axis=1, inplace=True)
    newdf_test.drop('service', axis=1, inplace=True)
    
    # step1: apply the logarithmic scaling method for scaling to obtain the ranges of `duration[0,4.77]', `src_bytes[0,9.11]' and `dst_bytes[0,9.11]
    newdf['log2_value1'] = np.log2(newdf['duration'].astype('float32'))
    newdf['log2_value2'] = np.log(newdf['src_bytes'].astype('int'))
    newdf['log2_value3'] = np.log(newdf['dst_bytes'].astype('int'))
    newdf=newdf.drop(['log2_value3','log2_value2','log2_value1'], axis=1)


    # testing set

    newdf_test['log2_value1'] = np.log2(newdf_test['duration'].astype('float32'))
    newdf_test['log2_value2'] = np.log(newdf_test['src_bytes'].astype('int'))
    newdf_test['log2_value3'] = np.log(newdf_test['dst_bytes'].astype('int'))
    newdf_test=newdf_test.drop(['log2_value3','log2_value2','log2_value1'], axis=1)
    
    labeldf=newdf['label']
    labeldf_test=newdf_test['label']


    # change the label column
    newlabeldf=labeldf.replace({ 'normal' : 0, 'neptune' : 1 ,'back': 1, 'land': 1, 'pod': 1, 'smurf': 1, 'teardrop': 1,'mailbomb': 1, 'apache2': 1, 'processtable': 1, 'udpstorm': 1, 'worm': 1,
                               'ipsweep' : 2,'nmap' : 2,'portsweep' : 2,'satan' : 2,'mscan' : 2,'saint' : 2
                               ,'ftp_write': 3,'guess_passwd': 3,'imap': 3,'multihop': 3,'phf': 3,'spy': 3,'warezclient': 3,'warezmaster': 3,'sendmail': 3,'named': 3,'snmpgetattack': 3,'snmpguess': 3,'xlock': 3,'xsnoop': 3,'httptunnel': 3,
                               'buffer_overflow': 4,'loadmodule': 4,'perl': 4,'rootkit': 4,'ps': 4,'sqlattack': 4,'xterm': 4})
    newlabeldf_test=labeldf_test.replace({ 'normal' : 0, 'neptune' : 1 ,'back': 1, 'land': 1, 'pod': 1, 'smurf': 1, 'teardrop': 1,'mailbomb': 1, 'apache2': 1, 'processtable': 1, 'udpstorm': 1, 'worm': 1,
                               'ipsweep' : 2,'nmap' : 2,'portsweep' : 2,'satan' : 2,'mscan' : 2,'saint' : 2
                               ,'ftp_write': 3,'guess_passwd': 3,'imap': 3,'multihop': 3,'phf': 3,'spy': 3,'warezclient': 3,'warezmaster': 3,'sendmail': 3,'named': 3,'snmpgetattack': 3,'snmpguess': 3,'xlock': 3,'xsnoop': 3,'httptunnel': 3,
                                'buffer_overflow': 4,'loadmodule': 4,'perl': 4,'rootkit': 4,'ps': 4,'sqlattack': 4,'xterm': 4})



    #put the new label column back
    newdf['label'] = newlabeldf
    newdf_test['label'] = newlabeldf_test
    
    x = newdf.drop(["label"],1)  # features
    y = newlabeldf  # label
    # test set:
    print(len(x.columns))
    xtest = newdf_test.drop(['label'],1) # features
    xtest = pd.DataFrame(xtest, columns=x.columns)
    xtest = xtest.fillna(0)
    ytest = newlabeldf_test # label
    
    return xtest

path1 = """/home/sahma61/PY_workspace/Deep-learning-for-intrusion-detection-using-Recurrent-Neural-network-RNN/NSL_KDD_Train.csv"""
path2 = """/home/sahma61/PY_workspace/Deep-learning-for-intrusion-detection-using-Recurrent-Neural-network-RNN/NSL_KDD_Test.csv"""
## add the columns' name and read the KDDTrain+ and KDDTest+ datasets
col_names = ["duration","protocol_type","service","flag","src_bytes",
    "dst_bytes","land","wrong_fragment","urgent","hot","num_failed_logins",
    "logged_in","num_compromised","root_shell","su_attempted","num_root",
    "num_file_creations","num_shells","num_access_files","num_outbound_cmds",
    "is_host_login","is_guest_login","count","srv_count","serror_rate",
    "srv_serror_rate","rerror_rate","srv_rerror_rate","same_srv_rate",
    "diff_srv_rate","srv_diff_host_rate","dst_host_count","dst_host_srv_count",
    "dst_host_same_srv_rate","dst_host_diff_srv_rate","dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate","dst_host_serror_rate","dst_host_srv_serror_rate",
    "dst_host_rerror_rate","dst_host_srv_rerror_rate","label"]
