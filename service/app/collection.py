from flask import jsonify
# import MySQLdb
# from db import connection
import cups
import os, sys
import urlparse
import time, datetime
import base64
import urllib, json
from os import listdir
from os.path import isfile, join

def get_camera_roll():
    rootdir = os.getcwd()
    directory = "app\camera-roll"
    path = join(rootdir, directory)
    cameraroll = []
    for f in listdir(directory):
        photo = join(path, f)
        if isfile(photo):
            cameraroll.append(f)

    return json.dumps(cameraroll)

# def save_collection(name, q, geoLocation, date, data, instagram_count, twitter_count, total_count):
#     result = {
#         'success': 0,
#         'code': 0,
#         'message': ""
#     }

#     sql = ("INSERT INTO search (name, q, search_date, geolocation, data, instagram_count, twitter_count, total_count) "
#              "VALUES (%(name)s, %(q)s, %(geolocation)s, %(search_date)s, %(data)s, %(instagram_count)s, %(twitter_count)s, %(total_count)s)")
#     params = {
#         'name': name,
#         'q': q,
#         'search_date': date,
#         'geolocation': geoLocation,
#         'data': data,
#         'instagram_count': str(instagram_count),
#         'twitter_count': str(twitter_count),
#         'total_count': str(total_count)
#     }

#     try:
#         cur = connection.cursor()
#         query = cur.execute(sql, params)
#         if (query > 0):
#             result = {
#                 'success': 1,
#                 'code': 201,
#                 'message': "Search results has been saved."
#             }

#         connection.commit()

#     except MySQLdb.IntegrityError:
#         result = {
#             'success': 0,
#             'code': -201,
#             'message': "An error has occurred on saving the search results. Please try again"
#         }

#     finally:
#        cur.close()

#     return jsonify(result)
    
# Print from image source
def print_from_source(img_src):
    result = {
        'success': 0,
        'code': 0,
        'message': ""
    }
    
    file_name = urlparse.urlsplit(img_src)
    file_name = file_name.path.split("/")[-1]
    directory = "app/archive/print"
    full_path = os.path.join(directory, file_name)
    urllib.urlretrieve(img_src, full_path)
    file_name = full_path    
    result = print_file(file_name)
    
    return jsonify(result)
    
# Print from data URI
def print_from_data(dataURL, source):
    result = {
        'success': 0,
        'code': 0,
        'message': ""
    }
    
    if (source == "search"):
        directory = "app/archive/print"
    else:
        directory = "app/camera-roll"

    timestamp = time.time()
    current_datetime = datetime.datetime.fromtimestamp(timestamp)
    file_name = "PHOTO_" + current_datetime.strftime('%Y%m%d_%H%M%S') + ".png"
    full_path = os.path.join(directory, file_name)    
    decoded_data = base64.b64decode(dataURL)
    
    with open(full_path, 'wb') as fp:
        fp.write(decoded_data)
        fp.close()
        
    file_name = full_path
    result = print_file(file_name)
   
    return jsonify(result)


# Queue to printer
def print_file(file_name):
    result = {
        'success': 0,
        'code': 0,
        'message': ""
    }
    
    result = {
        'success': 1,
        'code': 202,
        'message': "Image was queued for printing."
    }
        
    try:
        filename = urlparse.urlsplit(file_name)
        filename = filename.path.split("/")[-1]
        conn = cups.Connection()
        printer = conn.getDefault()
        printer_returns = conn.printFile(printer, file_name, filename, {})
        print file_name
        print printer_returns

        result = {
            'success': 1,
            'code': 202,
            'message': "Image was queued for printing."
        }
    except cups.IPPError as (status, description):
        print "IPP status is %d" % status
        print "Description: ", description
        result = {
            'success': 0,
            'code': -202,
            'message': "Failed to add the image to printing queue."
        }
    
    return result
