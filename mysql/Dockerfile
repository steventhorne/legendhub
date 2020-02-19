FROM debian:stretch

WORKDIR /docker-entrypoint-initdb.d

COPY backup.sql /docker-entrypoint-initdb.d/

RUN groupadd -r mysql && useradd -r -g mysql mysql

RUN apt update && apt install -y cron

RUN { \
        echo mysql-server mysql-server/data-dir select ''; \
        echo mysql-server mysql-server/root-pass password ''; \
        echo mysql-server mysql-server/re-root-pass password ''; \
        echo mysql-server mysql-server/remove-test-db select false; \
        } | debconf-set-selections \
        && apt install -y wget mysql-server=5.5* && rm -rf /var/lib/apt/lists/* \
        && rm -rf /var/lib/mysql && mkdir -p /var/lib/mysql && chown -R mysql:mysql /var/lib/mysql

RUN sed -Ei 's/^(log)/#&/' /etc/mysql/my.cnf
RUN echo "[mysqld]" >> /etc/mysql/my.cnf
RUN echo "bind-address = 0.0.0.0" >> /etc/mysql/my.cnf

COPY cron-mysql /etc/cron.d/

COPY entrypoint.sh /
RUN chmod a+x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE $MYSQL_INTERNAL_PORT
