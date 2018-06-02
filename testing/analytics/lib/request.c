/*****
* Request Module
*
* Mauricio Esquivel Rogel
*
*****/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "request.h"

/******************************* constants *****************************/
#define REQUEST_GET 0
#define REQUEST_POST 1
#define INFO_MAX_LEN 255

typedef struct date {
  int y;
  int m;
  int d;
} date_t;

typedef struct timeslot {
  int h;
  int m;
  int s;
} timeslot_t;

typedef struct request {
  date_t *date;
  timeslot_t *time;
  int type;
  char *info;
} request_t;



request_t  *request_new(const char *line) {
  request_t *req = NULL;
  char extra[255];

  if (line != NULL && (req = malloc(sizeof(request_t))) != NULL) {
    char type[5];

    if ((req->date = malloc(sizeof(date_t))) == NULL) {
      free(req);
      fprintf(stderr, "request_new: malloc error with date\n");
      return NULL;
    }

    if ((req->time = malloc(sizeof(timeslot_t))) == NULL) {
      free(req->date);
      free(req);
      fprintf(stderr, "request_new: malloc error with time\n");
      return NULL;
    }

    if ((req->info = malloc(INFO_MAX_LEN)) == NULL) {
      free(req->time);
      free(req->date);
      free(req);
      fprintf(stderr, "request_new: malloc error with info\n");
      return NULL;
    }

    if (sscanf(line, "\x1b[36m%d-%d-%d %d:%d:%d:\x1b[0m %[A-Z]: %[^\n]s", &(req->date->y),
               &(req->date->m), &(req->date->d), &(req->time->h),
               &(req->time->m), &(req->time->s), type, req->info) != 8) {
      request_destroy(req);
      return NULL;
    }

    if (strcmp(type, "GET") == 0) {
      req->type = REQUEST_GET;
    } else if (strcmp(type, "POST") == 0) {
      req->type = REQUEST_POST;
    } else {
      request_destroy(req);
      fprintf(stderr, "request_new: '%s': only GET and POST requests allowed\n",
              type);
      return NULL;
    }
  }

  return req;
}

void request_print(request_t *req, int date, int time, int reqtype, int info)
{
  if (req == NULL) { return; }

  if (date) {
    printf("%04d-%02d-%02d", req->date->y, req->date->m, req->date->d);
  }

  if (time) {
    if (date) { printf(" "); }

    printf("%02d:%02d:%02d: ", req->time->h, req->time->m, req->time->s);
  } else if (date) {
    printf(": ");
  }

  if (reqtype) {
    printf("%s: ", req->type == REQUEST_GET ? "GET" : "POST");
  }

  if (info) { printf("%s", req->info); }

  puts("");
}

void request_destroy(request_t *req)
{
  if (req != NULL) {
    if (req->date != NULL) { free(req->date); };
    if (req->time != NULL) { free(req->time); };
    if (req->info != NULL) { free(req->info); };
    free(req);
  }
}
