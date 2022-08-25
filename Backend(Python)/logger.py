import datetime
import os

class singleton:
    def __init__(self, aClass):
        self.aClass = aClass
        self.instance = None
    
    def __call__(self, *args, **kwargs):
        if self.instance is None:
            self.instance = self.aClass(*args, **kwargs)
        return self.instance

@singleton
class logger:
    def __init__(self, name, path):
        self.name = name
        self.path = path
        if not os.path.isfile(self.path):
            with open(self.path, 'w') as file:
                file.write(f"-------INITIALIZED LOGGER {self.name} ON {datetime.datetime.now()}-------")

    def info(self, msg):
        msg = f"{datetime.datetime.now()}: {self.name} LOGGER.INFO: {msg}"
        with open(self.path, 'a') as file:
            file.write('\n' + msg)
        print('\n' + msg)

    def __str__(self):
        return 'LOGGER({!s})'.format(self.name)

    def __repr__(self):
        return 'LOGGER({!r})'.format(self.name)
