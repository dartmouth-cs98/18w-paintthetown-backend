# Makefile for 'line' module
#
# David Kotz, April 2016, 2017
# updated by Xia Zhou, July 2016
# updated by Mauricio Esquivel Rogel, May 2018
OBJS = line.o hashtable.o jhash.o memory.o set.o
LIB = libanalyzer.a

FLAGS =

CFLAGS = -Wall -pedantic -std=c11 -ggdb $(FLAGS)
CC = gcc
MAKE = make

$(LIB): $(OBJS)
	ar cr $(LIB) $(OBJS)

line.o: line.h
jhash.o: jhash.h
memory.o: memory.h
set.o: set.h
hashtable.o: hashtable.h jhash.h memory.h set.h

.PHONY: clean

clean:
	rm -f *~ *.o *.dSYM
	rm -f $(LIB)
	rm -f *core
