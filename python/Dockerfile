FROM debian

RUN apt-get update && apt-get install -y python3 python3-pip cron

WORKDIR /python

COPY src .

RUN /usr/bin/pip3 install -r requirements.txt --break-system-packages

RUN chmod +x notification_listener.py routine_maintenance.py run-cron.py

COPY cron-python /etc/cron.d/

CMD ["/usr/bin/python3", "/python/run-cron.py"]
