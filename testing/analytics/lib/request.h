#ifndef __REQUEST_H
#define __REQUEST_H

/******************************* global types *****************************/
typedef struct request request_t;

/******************************* global functions *****************************/
void request_print(request_t *req, int date, int time, int reqtype, int info);
void request_destroy(request_t *request);
request_t  *request_new(const char *line);

#endif //__REQUEST_H
