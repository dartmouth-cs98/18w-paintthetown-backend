#ifndef __LINE_H
#define __LINE_H

/******************************* global types *****************************/
typedef struct line line_t;

/******************************* global functions *****************************/
void line_print(line_t *req, int date, int time, int reqtype, int info);
void line_destroy(line_t *line);
line_t  *line_new(const char *line);

#endif //__LINE_H
