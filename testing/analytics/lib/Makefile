# Makefile for 'request' module
#
# David Kotz, April 2016, 2017
# updated by Xia Zhou, July 2016
# updated by Mauricio Esquivel Rogel, May 2018
OBJS = request.o
LIB = libanalyzer.a

FLAGS =

CFLAGS = -Wall -pedantic -std=c11 -ggdb $(FLAGS)
CC = gcc
MAKE = make

$(LIB): $(OBJS)
	ar cr $(LIB) $(OBJS)

request.o: request.h

.PHONY: clean

clean:
	rm -f *~ *.o *.dSYM
	rm -f $(LIB)
	rm -f *core
