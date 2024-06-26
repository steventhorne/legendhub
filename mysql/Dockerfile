FROM debian

RUN apt update && apt install -y cron

COPY cron-mysql /etc/cron.d/cron-mysql
 
RUN chmod 0644 /etc/cron.d/cron-mysql

RUN crontab /etc/cron.d/cron-mysql
 
RUN touch /var/log/cron.log
 
CMD cron && tail -f /var/log/cron.log
