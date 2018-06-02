# Makefile for 'analyzer' module
#
# David Kotz, April 2016, 2017
# updated by Xia Zhou, July 2016
# updated by Mauricio Esquivel Rogel, May 2018
L = ../lib

PROG = analyzer
LIBS =
LLIBS = $L/libanalyzer.a

# uncomment the following to turn on verbose memory logging
# (comment or uncomment the following, then "make clean; make")
# TESTING=-DMEMTEST

CFLAGS = -Wall -pedantic -std=c11 -ggdb $(TESTING) -I$L
CC = gcc
MAKE = make

.PHONY: clean

all: $(PROG)

$(PROG): analyzer.o $(LLIBS)
	$(CC) $(CFLAGS) $^ $(LIBS) -o $@

analyzer.o: $L/line.h

clean:
	rm -f *~ *.o *.dSYM
	rm -f $(PROG)
	rm -f *core
