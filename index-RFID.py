#!/usr/bin/env python

import RPi.GPIO as GPIO
import SimpleMFRC522
import requests
import datetime
import time

reader = SimpleMFRC522.SimpleMFRC522()

epoch = datetime.datetime.utcfromtimestamp(0)

def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0

try:
  # TODO: would add a time last seen as well so
  # that we could have a min time between registering
  # a swipe from the same RFID fob
  last_id_seen = ''
  last_time_seen = 0
  while(True):
    id, text = reader.read()

    dte = unix_time_millis(datetime.datetime.now())
    #dte = int(round(time.time() * 1000))
    print("dte: {}".format(dte))

    if last_id_seen == id and last_time_seen < (dte - 10000):
		continue

    print("Got new id: " + str(id) + ", text: " + text)

    #dte = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:')
    last_time_seen = dte
    json = {"employee_id":str(id), "datetime":str(dte) }
    headers = {'Content-type':'application/json'}
    print("id: {}, text: {}, dte: {}".format(id, text, dte))
    print("Sending POST request.")
    r = requests.post('http://localhost/swipes',\
      json=json, headers=headers)
    print("HTTP Response code: " + str(r.status_code))

    last_id_seen = id

    print("status_code: {}".format(r.status_code))

    time.sleep(1)

finally:
        GPIO.cleanup()
