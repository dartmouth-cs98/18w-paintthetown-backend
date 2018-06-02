# Makefile for 'analyzer' module
#
# David Kotz, April 2016, 2017
# updated by Xia Zhou, July 2016
# updated by Mauricio Esquivel Rogel, May 2018
L = lib

MAKE = make
PROG = analyzer/analyzer
LLIBS = $L/libanalyzer.a

all:
	$(MAKE) -C lib
	$(MAKE) -C analyzer

.PHONY: all clean

clean:
	rm -f *~
	$(MAKE) -C lib clean
	$(MAKE) -C analyzer clean
