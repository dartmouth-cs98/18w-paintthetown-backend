/*****
* Line Module
*
* Mauricio Esquivel Rogel
*
*****/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "line.h"

/******************************* constants *****************************/
#define LINE_GET 0
#define LINE_POST 1
#define LINE_START 2
#define LINE_END 3
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

typedef struct line {
  date_t *date;
  timeslot_t *time;
  int type;
  void *info;
} line_t;



line_t  *line_new(const char *line) {
  line_t *req = NULL;
  char extra[255];

  if (line != NULL && (req = malloc(sizeof(line_t))) != NULL) {
    char type[5];

    if ((req->date = malloc(sizeof(date_t))) == NULL) {
      free(req);
      fprintf(stderr, "line_new: malloc error with date\n");
      return NULL;
    }

    if ((req->time = malloc(sizeof(timeslot_t))) == NULL) {
      free(req->date);
      free(req);
      fprintf(stderr, "line_new: malloc error with time\n");
      return NULL;
    }

    if ((req->info = malloc(INFO_MAX_LEN)) == NULL) {
      free(req->time);
      free(req->date);
      free(req);
      fprintf(stderr, "line_new: malloc error with info\n");
      return NULL;
    }

    char *format = "\x1b[36m%d-%d-%d %d:%d:%d:\x1b[0m ";
    bool is_request = strstr(line, 'REQ_') == NULL;

    if (is_request) {
      format += "%[A-Z]: %[^\n]s";
    } else {
      format += "REQ_%[A-Z]: %li";
    } if (sscanf(line, ,
                      &(req->date->y), &(req->date->m), &(req->date->d),
                      &(req->time->h), &(req->time->m), &(req->time->s), type,
                      req->info) != 8) {
      line_destroy(req);
      return NULL;
    }

    if (strcmp(type, "GET") == 0) {
      req->type = LINE_GET;
    } else if (strcmp(type, "POST") == 0) {
      req->type = LINE_POST;
    } else {
      line_destroy(req);
      fprintf(stderr, "line_new: '%s': only GET and POST lines allowed\n",
              type);
      return NULL;
    }
  }

  return req;
}

void line_print(line_t *req, int date, int time, int reqtype, int info)
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
    switch (req->type) {
      case LINE_GET: printf("GET: "); break;
      case LINE_POST: printf("POST: "); break;
      case LINE_START: printf("REQ_START: "); break;
      case LINE_END: printf("REQ_END: "); break;
      default: ;
    }
  }

  if (info) {
    switch (req->type) {
      case LINE_GET: case LINE_POST: printf("%s", (char *)(req->info)); break;
      case LINE_START: case LINE_END: printf("%li", *((size_t *)(req->info))); break;
      default: ;
    }
  }

  puts("");
}

void line_destroy(line_t *req)
{
  if (req != NULL) {
    if (req->date != NULL) { free(req->date); };
    if (req->time != NULL) { free(req->time); };
    if (req->info != NULL) { free(req->info); };
    free(req);
  }
}
