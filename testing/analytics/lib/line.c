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
#define LINE_TIMEFRAME 2
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


typedef struct timeframe {
  bool is_start;
  size_t val;
  size_t ref;
} timeframe_t;

typedef struct line {
  date_t *date;
  timeslot_t *time;
  int type;
  const char *fn_name;
  const char *cli_addr;
  void *info;
  timeframe_t *next;
} line_t;

line_t  *line_new(const char *line) {
  line_t *lineobj = NULL;

  if (line != NULL && (lineobj = malloc(sizeof(line_t))) != NULL) {
    char type[50];

    lineobj->next = NULL;

    if ((lineobj->date = malloc(sizeof(date_t))) == NULL) {
      free(lineobj);
      fprintf(stderr, "line_new: malloc error with date\n");
      return NULL;
    }

    if ((lineobj->time = malloc(sizeof(timeslot_t))) == NULL) {
      free(lineobj->date);
      free(lineobj);
      fprintf(stderr, "line_new: malloc error with time\n");
      return NULL;
    }

    char format[255] = "\x1b[36m%d-%d-%d %d:%d:%d:\x1b[0m ";
    bool is_request = strstr(line, "REQ_") == NULL;
    void *info_ptr = NULL;
    timeframe_t *tf = NULL;

    if (is_request) {
      strcat(format, "%[A-Z]: %[^\n]s");

      if ((lineobj->info = malloc(INFO_MAX_LEN)) == NULL) {
        free(lineobj->time);
        free(lineobj->date);
        free(lineobj);
        fprintf(stderr, "line_new: malloc error with info\n");
        return NULL;
      }

      info_ptr = lineobj->info;
    } else {
      strcat(format, "REQ_%[A-Z,_,0-9]: %li");

      if ((lineobj->info = malloc(sizeof(timeframe_t))) == NULL) {
        free(lineobj->time);
        free(lineobj->date);
        free(lineobj);
        fprintf(stderr, "line_new: malloc error with info\n");
        return NULL;
      }

      tf = (timeframe_t *)(lineobj->info);

      tf->is_start = strstr(line, "REQ_STRT") != NULL;
      lineobj->type = LINE_TIMEFRAME;

      info_ptr = &(tf->val);
    }

    if (sscanf(line, format, &(lineobj->date->y), &(lineobj->date->m), &(lineobj->date->d),
               &(lineobj->time->h), &(lineobj->time->m), &(lineobj->time->s), type,
               info_ptr) != 8) {
      line_destroy(lineobj);
      return NULL;
    }

    if (is_request) {
      if (strcmp(type, "GET") == 0) {
        lineobj->type = LINE_GET;
      } else if (strcmp(type, "POST") == 0) {
        lineobj->type = LINE_POST;
      } else {
        line_destroy(lineobj);
        fprintf(stderr, "line_new: '%s': only GET and POST lines allowed\n",
                type);
        return NULL;
      }
    } else if (!(tf->is_start) && sscanf(type, "END_%lu", &(tf->ref)) != 1) {
      line_destroy(lineobj);
      return NULL;
    }
  }

  return lineobj;
}

size_t line_timeframe_end_get(line_t *line)
{
  if (line == NULL || line->type != LINE_TIMEFRAME || line->next == NULL) {
    return -1;
  }

  return line->next->val;
}

bool line_timeframe_end_set(line_t *prev, line_t *line)
{
  if (prev == NULL || line == NULL || prev->next != NULL ||
      line->next != NULL || line->type != LINE_TIMEFRAME ||
      prev->type != LINE_TIMEFRAME) {
    return false;
  }

  timeframe_t *tf1 = (timeframe_t *)prev->info,
              *tf2 = (timeframe_t *)line->info;

  if (tf2->ref != tf1->val) { return false; }

  prev->next = tf2;

  return true;
}

bool line_is_start_timeframe(line_t *line)
{
  if (line == NULL || line->type != LINE_TIMEFRAME) { return false; }

  timeframe_t *tf = (timeframe_t *)(line->info);

  return tf->is_start;
}

bool line_get_key(line_t *line, char *key)
{
  if (line == NULL || line->type != LINE_TIMEFRAME) { return false; }

  timeframe_t *tf = line->info;

  if (tf->is_start) { sprintf(key, "%li", tf->val); }
  else { sprintf(key, "%li", tf->ref); }

  return true;
}

void line_print(line_t *lineobj, int date, int time, int reqtype, int info)
{
  if (lineobj == NULL) { return; }

  if (date) {
    printf("%04d-%02d-%02d", lineobj->date->y, lineobj->date->m, lineobj->date->d);
  }

  if (time) {
    if (date) { printf(" "); }

    printf("%02d:%02d:%02d: ", lineobj->time->h, lineobj->time->m, lineobj->time->s);
  } else if (date) {
    printf(": ");
  }

  if (reqtype) {
    switch (lineobj->type) {
      case LINE_GET: printf("GET: "); break;
      case LINE_POST: printf("POST: "); break;
      case LINE_TIMEFRAME:
        if (((timeframe_t *)(lineobj->info))->is_start) {
          printf("REQ_START: ");
        } else {
          printf("REQ_END: ");
        }
        break;
      default: ;
    }
  }

  if (info) {
    switch (lineobj->type) {
      case LINE_GET: case LINE_POST:
        printf("%s", (char *)(lineobj->info));
        break;
      case LINE_TIMEFRAME:
        printf("%li", ((timeframe_t *)(lineobj->info))->val);
        break;
      default: ;
    }
  }

  puts("");
}

void line_destroy(line_t *lineobj)
{
  if (lineobj != NULL) {
    if (lineobj->date != NULL) { free(lineobj->date); };
    if (lineobj->time != NULL) { free(lineobj->time); };
    if (lineobj->info != NULL) { free(lineobj->info); };
    free(lineobj);
  }
}
