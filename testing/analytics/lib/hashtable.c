/* 
 * hashtable.c - CS50 hashtable module
 *
 * see hashtable.h for more information.
 *
 * David Kotz, April 2016, 2017
 * updated by Xia Zhou, July 2016
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hashtable.h"
#include "jhash.h"
#include "set.h"
#include "memory.h"

/**************** file-local global variables ****************/
/* none */

/**************** local types ****************/
/* none */

/**************** global types ****************/
typedef struct hashtable {
  int num_slots;		      // number of slots in the table
  set_t **table;		      // table[num_slots] of set_t*
} hashtable_t;

/**************** global functions ****************/
/* that is, visible outside this file */
/* see hashtable.h for comments about exported functions */

/**************** local functions ****************/
/* not visible outside this file */
/* none */

/**************** hashtable_new() ****************/
hashtable_t *
hashtable_new(const int num_slots)
{
  if (num_slots <= 0) {
    return NULL; // bad number of slots
  } 

  hashtable_t *ht = count_malloc(sizeof(hashtable_t));
  if (ht == NULL) {
    return NULL; // error allocating hashtable
  } 

  // initialize contents of hashtable structure
  ht->num_slots = num_slots;
  ht->table = count_malloc(num_slots * sizeof(set_t *));
  if (ht->table == NULL) {
    count_free(ht);	      // error allocating table
    return NULL;
  } 

  // initialize each table entry to be a set
  for (int slot = 0; slot < num_slots; slot++) {
    set_t *new = set_new();
    if (new != NULL) {
      ht->table[slot] = new;
    } else {
      // malloc failure; unwind all we've created. [sigh]
      while (--slot >= 0)
        set_delete(ht->table[slot], NULL);
      count_free(ht->table);
      count_free(ht);
      return NULL;
    }
  }

  return ht;
}

/**************** hashtable_insert() ****************/
bool
hashtable_insert(hashtable_t *ht, const char *key, void *item)
{
  if (ht == NULL || key == NULL || item == NULL) {
    return false;	      // bad parameter
  }
  
  int slot = JenkinsHash(key, ht->num_slots);

  bool inserted = set_insert(ht->table[slot], key, item);

#ifdef MEMTEST
  count_report(stdout, "After hashtable_insert");
#endif

  return inserted;
}


/**************** hashtable_find() ****************/
void *
hashtable_find(hashtable_t *ht, const char *key)
{
  if (ht == NULL || key == NULL) {
    return NULL;	      // bad ht or bad key
  } else {
    int slot = JenkinsHash(key, ht->num_slots);
    return set_find(ht->table[slot], key);
  }
}

/**************** hashtable_print() ****************/
void
hashtable_print(hashtable_t *ht, FILE *fp, 
		void (*itemprint)(FILE *fp, const char *key, void *item) )
{
  if (fp != NULL) {
    if (ht == NULL) {
      fputs("(null)", fp);      // bad hashtable
    } else {
      // print one line per slot
      for (int slot = 0; slot < ht->num_slots; slot++) {
	printf("%4d: ", slot);
	set_print(ht->table[slot], fp, itemprint);
	printf("\n");
      }
    }
  }
}

/**************** hashtable_iterate() ****************/
void
hashtable_iterate(hashtable_t *ht, void *arg, 
		  void (*itemfunc)(void *arg, const char *key, void *item) )
{
  if (ht != NULL && itemfunc != NULL) {
    // iterate over each slot's set
    for (int slot = 0; slot < ht->num_slots; slot++) {
      set_iterate(ht->table[slot], arg, itemfunc);
    }
  }
}

/**************** hashtable_delete() ****************/
void 
hashtable_delete(hashtable_t *ht, void (*itemdelete)(void *item) )
{
  if (ht == NULL) {
    return; // bad hashtable
  } else {
    // delete set in each slot
    for (int slot = 0; slot < ht->num_slots; slot++) {
      set_delete(ht->table[slot], itemdelete);
    }
    // delete the table, and the overall struct
    count_free(ht->table);
    count_free(ht);
  }
#ifdef MEMTEST
  count_report(stdout, "End of hashtable_delete");
#endif
}
