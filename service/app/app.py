from flask import Flask, jsonify, request
from flask.ext.cors import CORS
from instagram.client import InstagramAPI
from instagram.bind import InstagramAPIError
import urllib
import tweepy
import sys, requests, json, cgi
import collection
import datetime, time, calendar
import requests, requests_oauthlib

app = Flask(__name__)
CORS(app)

reload(sys)  
sys.setdefaultencoding('utf8')

###################
## INSTAGRAM API ##
###################

# Instagram Client Info
instagram_settings = {
    'client_id': "6a2c8ea14aec48c1a24d45ce17d862b4",
    'client_secret': "86a0e5f5e5744da9812f846afc8ef653",
    'redirect_uri': "http://local.fx-plus.com/authorize/instagram",
    'scope': ["basic"],
    'access_token': "2159469251.6a2c8ea.be9c0eaf6ce64452bae36457f9294355"
}
instagram_API = InstagramAPI(client_id=instagram_settings['client_id'], client_secret=instagram_settings['client_secret'], redirect_uri=instagram_settings['redirect_uri'], access_token=instagram_settings['access_token'])


@app.route("/api/instagram/search")
def instagram_search():
    # parameters
    q = request.args.get('q')
    min_timestamp = request.args.get('min_timestamp')
    max_timestamp = request.args.get('max_timestamp')
    distance = request.args.get('distance')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    search_type = request.args.get('search_type')
    max_id = request.args.get('max_id')

    if max_id is not None:
        max_id = max_id.split(',')

    result = {
        'last_id': [],
        'data': []
    }
        
    ctr = 0

    if (search_type == "tag"):
        tags = q.split(' ')
        media_ids = []

        # iterate over array of tags
        # and perform a search
        for tag in tags:
            if max_id is not None:
                last_id = str(max_id[ctr])
            else:
                last_id = None

            ctr = ctr + 1              
            search_result = instagram_tag_search(tag, last_id)
            result['last_id'].append(search_result['last_id'])

            # iterate over returned data
            # and check if tags were included
            for data in search_result['data']:
                append = 0
                for tag in tags:
                    if tag in data['tags']:
                        append = 1

                    else:
                        append = 0
                        break

                if (append == 1):
                    if (data['media_id'] not in media_ids):
                        append = 1
                    else:
                        append = 0
                    
                if (append == 1):
                    result['data'].append(data)
                    media_ids.append(data['media_id'])

    elif (search_type == "media"):
        if max_id is not None:
            max_timestamp = max_id[ctr]

        if (q == ""):
            search_result = instagram_media_search(min_timestamp, max_timestamp, distance, lat, lng)
            result['last_id'].append(search_result['last_id'])
            result['data'].extend(search_result['data'])

        elif (q != ""):
            tags = q.split(' ')

            search_result = instagram_media_search(min_timestamp, max_timestamp, distance, lat, lng)
            result['last_id'].append(search_result['last_id'])

            # iterate over returned data
            # and check if tags were included
            for data in search_result['data']:
                append = 0
                for tag in tags:
                    if tag in data['tags']:
                        append = 1
                    else:
                        append = 0
                        break

                if (append == 1):
                    result['data'].append(data)


    return json.dumps(result)


def instagram_tag_search(tag, max_id):
    return_data = {
        'last_id': "",
        'data': []
    }
    medias, next = instagram_API.tag_recent_media(tag_name=tag, count=50, max_tag_id=max_id)
    if next is not None:
        temp, max_tag = next.split('max_tag_id=')
        last_id = str(max_tag)
    else:
        last_id = ""

    for media in medias:
        if (media.type == "image"):
            tags = []
            for value in media.tags:
                tag = str(value)
                temp, tag = tag.split("Tag: ")
                tags.append(tag)

            media_id = str(media)
            temp, media_id = media_id.split("Media: ")

            data = {
                'media_id': media_id,
                'tags': tags,
                'url': media.link,
                'text': cgi.escape(media.caption.text).encode('ascii', 'xmlcharrefreplace').decode('utf-8'),
                'created_at': str(media.created_time),
                'thumbnail': media.images['thumbnail'].url,
                'media_url': media.images['standard_resolution'].url,
                'source': "instagram"
            }
            return_data['data'].append(data)

    return_data['last_id'] = last_id
    return return_data


def instagram_media_search(min_timestamp, max_timestamp, distance, lat, lng):
    return_data = {
        'last_id': "",
        'data': []
    }

    medias = instagram_API.media_search(min_timestamp=min_timestamp, max_timestamp=max_timestamp, distance=distance, lat=lat, lng=lng, count=50)

    for media in medias:
        if (media.type == "image"):
            tags = []
            for value in media.tags:
                tag = str(value)
                temp, tag = tag.split("Tag: ")
                tag = cgi.escape(tag).encode('ascii', 'xmlcharrefreplace').decode('utf-8')
                tags.append(str(tag))

            if hasattr(media, 'caption') and media.caption is not None:
                text = media.caption.text
                text = cgi.escape(text).encode('ascii', 'xmlcharrefreplace').decode('utf-8')
            else:
                text = ""

            media_id = str(media)
            temp, media_id = media_id.split("Media: ")

            data = {
                'media_id': media_id,
                'tags': tags,
                'url': media.link,
                'text': text,
                'created_at': str(media.created_time),
                'thumbnail': media.images['thumbnail'].url,
                'media_url': media.images['standard_resolution'].url,
                'source': "instagram"
            }

            t = media.created_time.strftime("%Y-%m-%d %H:%M:00")
            t = calendar.timegm(datetime.datetime.strptime(t, "%Y-%m-%d %H:%M:%S").timetuple())
            return_data['last_id'] = t
            return_data['data'].append(data)
    
    return return_data




#################
## TWITTER API ##
#################

twitter_settings = {
    'consumer_token': "V1LEN1qCxKlVzGSKDRfn0Hu8u",
    'consumer_secret': "dQena8u0m6h8wgi25frn24v6prQeDlqmLVjDZCyZnnglp58qtt",
    'access_token': "3554919912-VCJy39CoXglNdkVQOgJ6YArneGOV4oXcrgAvSbp",
    'access_token_secret': "HMvaw3blyRi9PBE2pugzuFh5nNMiioHOvxLThpTcevzwa"
}
twitter_auth = tweepy.OAuthHandler(twitter_settings['consumer_token'], twitter_settings['consumer_secret'])
twitter_auth.set_access_token(twitter_settings['access_token'], twitter_settings['access_token_secret'])
twitter_API = tweepy.API(twitter_auth)

# Media search
# https://api.instagram.com/v1/media/search?lat=48.858844&lng=2.294351&access_token=ACCESS-TOKEN
@app.route("/api/twitter/search")
def twitter_search():
    q = request.args.get('q')
    # place = "philippines"
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    radius = request.args.get('radius')
    since = request.args.get('since')
    until = request.args.get('until')
    max_id = request.args.get('max_id')

    if q != "" or q is not None:
        q = q + " "

    if since != "" and until != "":
        daterange = "since:" + since + " until:" + until
    else:
        daterange = ""

    query = q + daterange
    if radius != "" and lat != "" and lng != "":
        geocode = "{},{},{}km".format(lat, lng, radius)
    else:
        geocode = ""

    last_id = ""
    data = []

    c = tweepy.Cursor(twitter_API.search, q=query, max_id=max_id, geocode=geocode).items(100)
    while (1):
        try:
            tweet = c.next();

            if 'media' in tweet.entities:
                text = cgi.escape(tweet.text).encode('ascii', 'xmlcharrefreplace')
                text = text.decode('utf-8')
                tweetData = {
                    'media_id': tweet.id_str,
                    'url': "https://twitter.com/statuses/{}".format(tweet.id_str),
                    'text': text,
                    'media_url': tweet.entities['media'][0]['media_url'].replace('\/', '/'),
                    'thumbnail': tweet.entities['media'][0]['media_url'].replace('\/', '/'),
                    'created_at': tweet.created_at.strftime('%Y-%m-%d'),
                    'source': "twitter"
                }
                data.append(tweetData)
            
            last_id = tweet.id - 1
        except tweepy.TweepError as e:
            print e
            break
        except StopIteration:
            break   
    
    response = {
        'last_id': last_id,
        'data': data
    }

    return json.dumps(response)




# Save collection
@app.route("/api/collections/save", methods=['GET', 'POST'])
def collection_save():
    requestData = request.json
    name = requestData['name']
    q = requestData['q']
    date = requestData['date']
    geoLocation = requestData['geoLocation']
    data = json.dumps(requestData['data'])
    instagram_count = requestData['instagram_count']
    twitter_count = requestData['twitter_count']
    total_count = requestData['total_count']

    result = collection.save_collection(name, q, date, geoLocation, data, instagram_count, twitter_count, total_count)
    return result

# Print image from source
@app.route("/api/collections/print", methods=['POST'])
def image_print():
    requestData = request.json
    img = requestData['img']

    result = collection.print_from_source(img)
    return result
    
# Print captured photo from data URI
# @app.route('/api/camera/print', methods=['POST'])
@app.route('/api/print', methods=['POST'])
def print_img():
    requestData = request.json
    dataURL = requestData['dataURL']
    source = requestData['source']
    
    result = collection.print_from_data(dataURL, source)
    return result
    
# Get photos from camera roll
@app.route('/api/camera-roll/get', methods=['GET'])
def cameraroll_get():    
    result = collection.get_camera_roll()
    return result


if __name__ == '__main__':
    app.run(debug=True)
