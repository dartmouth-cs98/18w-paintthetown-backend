#ifndef __LINE_H
#define __LINE_H

/******************************* global types *****************************/
typedef struct line line_t;

/******************************* global functions *****************************/
void line_print(line_t *req, int date, int time, int reqtype, int info);
void line_destroy(line_t *line);
size_t line_timeframe_end_get(line_t *line);
line_t  *line_new(const char *line);
bool line_get_key(line_t *line, char *key);
bool line_timeframe_end_set(line_t *prev, line_t *line);
bool line_is_start_timeframe(line_t *line);

#endif //__LINE_H
