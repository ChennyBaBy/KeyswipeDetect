#!/usr/bin/env python

from pirc522 import RFID
import requests
import datetime
import time
import signal
import sys
import array

def handle_sigint(sig, frame):
    exit(0)

signal.signal(signal.SIGINT, handle_sigint)

rdr = RFID()

epoch = datetime.datetime.utcfromtimestamp(0)

# Taken from https://github.com/pimylifeup/MFRC522-python
def uid_to_num(uid):
    n = 0
    for i in uid:
        n = n * 256 + i
    return n


def dte():
    return (datetime.datetime.now() - epoch).total_seconds() * 1000.0

recent_tags = {}

try:
    while True:
       rdr.wait_for_tag()
       (error, tag_type) = rdr.request()
       if not error:
           (error, id) = rdr.anticoll()
           if not error:
                id = uid_to_num(id)
                if recent_tags.get(id, None):
                    if (dte() - recent_tags[id]) < 5000:
                        continue
                    else:
                        del recent_tags[id]

                recent_tags[id] = dte()
                json = {"employee_id":str(id)}
                headers = {'Content-Type':'application/json', 'Accept': 'application/json'}
                print("Sending POST request.")
                print(json)
                r = requests.post('http://localhost/swipes', json=json, headers=headers)
                print("HTTP Response code: " + str(r.status_code))
                print("status_code: {}".format(r.status_code))

finally:
    rdr.cleanup()

# We don't need the auth and sector read code right now
#            # Select Tag is required before Auth
#            if not rdr.select_tag(id):
#                # Auth for block 10 (block 2 of sector 2) using default shipping key A
#                if not rdr.card_auth(rdr.auth_a, 10, [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], id):
#                    # This will print something like (False, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
#                    # Always stop crypto1 when done working
#                    rdr.stop_crypto()

