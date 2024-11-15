FROM redis:latest

COPY conf/redis/redis.conf /usr/local/etc/redis/redis.conf
CMD ["sh", "-c", "redis-server /usr/local/etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}"]