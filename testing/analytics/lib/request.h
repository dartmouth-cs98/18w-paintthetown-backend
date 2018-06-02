#ifndef __REQUEST_H
#define __REQUEST_H

/******************************* global types *****************************/
typedef struct request request_t;

/******************************* global functions *****************************/
void request_print(request_t *request, int date, int time, int reqtype);
void request_destroy(request_t *request);
request_t  *request_new(const char *line);

#endif //__REQUEST_H
