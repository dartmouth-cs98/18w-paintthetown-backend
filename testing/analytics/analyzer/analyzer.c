/*****
* Analyzer Module
*
* Mauricio Esquivel Rogel
*
*****/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "line.h"
#include "hashtable.h"

#define MAX_LINE 255
#define PROG argv[0]

bool parse_args(const int argc, const char *argv[], int *date, int *time,
                int *reqtype, int *info) {
  char extra;

  if (argc != 6) {
    fprintf(stderr, "%s: exactly 4 arguments required\n", PROG);
    return false;
  }

  if (sscanf(argv[1], "%d%c", date, &extra) != 1) {
    fprintf(stderr, "%s: '%s': invalid value for binary value 'date'\n",
            PROG, argv[1]);
    return false;
  }

  if (sscanf(argv[2], "%d%c", time, &extra) != 1) {
    fprintf(stderr, "%s: '%s': invalid value for binary value 'time'\n",
            PROG, argv[2]);
    return false;
  }

  if (sscanf(argv[3], "%d%c", reqtype, &extra) != 1) {
    fprintf(stderr, "%s: '%s': invalid value for binary value 'reqtype'\n",
            PROG, argv[3]);
    return false;
  }

  if (sscanf(argv[4], "%d%c", info, &extra) != 1) {
    fprintf(stderr, "%s: '%s': invalid value for binary value 'info'\n", PROG,
            argv[3]);
    return false;
  }

  return true;
}

void extract_line(char *buff_ptr, char **line) {
  char *end = buff_ptr;
  *line = buff_ptr;

  if (strlen(end) == 0) {
    *line = NULL;
    return;
  }

  while (strlen(end) > 0 && *end != '\n' && *end != '\0') { end++; }

  if (strlen(end) > 0) { *end = '\0'; }
}

void hashtable_destroy(void *item) {
  if (item == NULL) { return; }

  line_t *line = (line_t *)item;
  line_destroy(line);
}

int main(const int argc, const char *argv[]) {
  int PRINT_DATE = -1, PRINT_TIME = -1, PRINT_REQ_TYPE = -1, PRINT_INFO = -1;
  hashtable_t *ht = NULL;

  if (!parse_args(argc, argv, &PRINT_DATE, &PRINT_TIME, &PRINT_REQ_TYPE,
                  &PRINT_INFO)) {
    return 1;
  }

  if ((ht = hashtable_new(16)) == NULL) {
    fprintf(stderr, "%s: ran out of space", PROG);
    return -1;
  }

  char *buff = NULL;
  char *line = NULL;
  size_t len = strlen(argv[5]);

  if ((buff = malloc(len + 1)) == NULL) {
    fprintf(stderr, "%s: ran out of space", PROG);
    return -1;
  }

  strcpy(buff, argv[5]);
  extract_line(buff, &line);

  int status = 0;

  while (line != NULL) {
    line_t *lineobj = NULL;

    if ((lineobj = line_new(line)) != NULL) {
      line_print(lineobj, PRINT_DATE, PRINT_TIME, PRINT_REQ_TYPE, PRINT_INFO);
      char key[255];

      if (line_get_key(lineobj, key)) {
        line_t *prev = hashtable_find(ht, key);

        if (prev == NULL) {
          if (!hashtable_insert(ht, key, lineobj)) {
            fprintf(stderr, "%s: error inserting line to hashtable", PROG);
            line_destroy(lineobj);
            status = -1;
            break;
          }
        } else if (!line_is_start_timeframe(lineobj)) {
          size_t end = line_timeframe_end_get(prev);

          if (end != -1) {
            fprintf(stderr, "%s: end time already set", PROG);
            line_destroy(lineobj);
            status = -1;
            break;
          }

          if (!line_timeframe_end_set(prev, lineobj)) {
            fprintf(stderr, "%s: error appending end time", PROG);
            line_destroy(lineobj);
            status = -1;
            break;
          }
        }
      } else {
        line_destroy(lineobj);
      }
    }

    extract_line(line + strlen(line) + 1, &line);
  }

  hashtable_delete(ht, hashtable_destroy);

  free(buff);
  exit(status);
}
