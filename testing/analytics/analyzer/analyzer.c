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
#include "request.h"

#define MAX_LINE 255
#define PROG argv[0]

bool parse_args(const int argc, const char *argv[], int *date, int *time,
                int *reqtype) {
  char extra;

  if (argc != 5) {
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

  return true;
}

void extract_line(char *buff_ptr, char **line) {
  char *end = buff_ptr;
  *line = buff_ptr;

  while (strlen(end) > 0 && *end != '\n') { end++; }

  if (strlen(end) > 0) { *end = '\0'; }
  else { *line = NULL; }
}

int main(const int argc, const char *argv[]) {
  int PRINT_DATE = -1, PRINT_TIME = -1, PRINT_REQ_TYPE = -1;

  if (!parse_args(argc, argv, &PRINT_DATE, &PRINT_TIME, &PRINT_REQ_TYPE)) {
    return 1;
  }

  char *buff = NULL;
  char *line = NULL;
  size_t len = strlen(argv[4]);

  if ((buff = malloc(len + 1)) == NULL) {
    fprintf(stderr, "%s: ran out of space", PROG);
    return -1;
  }

  strcpy(buff, argv[4]);
  extract_line(buff, &line);

  while (line != NULL) {
    request_t *req = NULL;

    if ((req = request_new(line)) == NULL) {
      free(buff);
      fprintf(stderr, "%s: error with request\n", PROG);
      return -1;
    }

    request_print(req, PRINT_DATE, PRINT_TIME, PRINT_REQ_TYPE);
    request_destroy(req);

    extract_line(line + strlen(line) + 1, &line);
  }

  free(buff);
}
