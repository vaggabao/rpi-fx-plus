import MySQLdb
from ConfigParser import ConfigParser
import os

config_file = os.path.join("app", "config.ini")
section = 'mysql'

# create parser and read ini configuration file
parser = ConfigParser()
parser.read(config_file)

# get section, default to mysql
db_config = {}
if parser.has_section(section):
    items = parser.items(section)
    for item in items:
        db_config[item[0]] = item[1]
else:
    raise Exception('{0} not found in the {1} file'.format(section, config_file))

connection = MySQLdb.connect(host=db_config['host'], user=db_config['user'], passwd=db_config['password'], db=db_config['database'])
