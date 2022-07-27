FROM alpine:3.15.3

# Install the necessary packages.
RUN apk add --no-cache bash=5.1.16-r0
RUN apk add --no-cache rsync=3.2.3-r5
RUN apk add --no-cache git=2.34.1-r0
RUN apk add --no-cache yarn=1.22.17-r0
RUN apk add --no-cache openssh=8.8_p1-r1
