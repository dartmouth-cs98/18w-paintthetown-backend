/* 
 * set.c - CS50 set module
 *
 * see set.h for more information.
 *
 * David Kotz, April 2016, 2017
 * updated by Xia Zhou, July 2016
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "set.h"
#include "memory.h"

/**************** file-local global variables ****************/
/* none */

/**************** local types ****************/
typedef struct setnode {
  char *key;		           // search key for this item
  void *item;		           // pointer to data for this item
  struct setnode *next;		   // pointer to next item in set
} setnode_t;

/**************** global types ****************/
typedef struct set {
  struct setnode *head;	      // head of the set
} set_t;

/**************** global functions ****************/
/* that is, visible outside this file */
/* see set.h for comments about exported functions */

/**************** local functions ****************/
/* not visible outside this file */
static setnode_t *setnode_new(const char *key, void *item);

/**************** set_new() ****************/
set_t *
set_new(void)
{
  set_t *set = count_malloc(sizeof(set_t));

  if (set == NULL) {
    return NULL; // error allocating set
  } else {
    // initialize contents of set structure
    set->head = NULL;
    return set;
  }
}

/**************** set_insert() ****************/
bool
set_insert(set_t *set, const char *key, void *item)
{
  bool inserted = false;      // function result
  bool exist = false;         // whether the key exists

  if (set == NULL || key == NULL || item == NULL) {
    return false;       // bad parameter
  }

  // check if the key already exists in the set
  for (setnode_t *node = set->head; node != NULL; node = node->next) {
    if (strcmp(key, node->key) == 0) {
      exist = true; 
      break; 
    }
  }

  // insert new node at the head of set if it's a new key
  if (!exist) {
    setnode_t *new = setnode_new(key, item);
    if (new != NULL) {
      new->next = set->head;
      set->head = new;
      inserted = true; 
    }
  }

#ifdef MEMTEST
  count_report(stdout, "After set_insert");
#endif

  return inserted;
}


/**************** setnode_new ****************/
/* Allocate and initialize a setnode.
 * Returns NULL on error, or key is NULL, or item is NULL.
 */
static setnode_t * // not visible outside this file
setnode_new(const char *key, void *item)
{
  if (key == NULL || item == NULL) {
    return NULL;
  }

  setnode_t *node = count_malloc(sizeof(setnode_t));
  if (node == NULL) {
    // error allocating memory for node; return error
    return NULL;
  }

  node->key = count_malloc(strlen(key)+1);
  if (node->key == NULL) {
    // error allocating memory for key; 
    // cleanup and return error
    count_free(node);
    return NULL;
  } else {
    strcpy(node->key, key);
    node->item = item;
    node->next = NULL;
    return node;
  }
}

/**************** set_find() ****************/
void *
set_find(set_t *set, const char *key)
{
  if (set == NULL || key == NULL) {
    return NULL; // bad set or bad key
  } else {
    // scan the set
    for (setnode_t *node = set->head; node != NULL; node = node->next) {
      if (strcmp(key, node->key) == 0) {
        return node->item; // found!  return the node's item
      }
    }
    return NULL; // not found!
  }
}

/**************** set_print() ****************/
void
set_print(set_t *set, FILE *fp, 
	  void (*itemprint)(FILE *fp, const char *key, void *item) )
{
  if (fp != NULL) {
    if (set == NULL) {
      fputs("(null)", fp);
      return; // bad set
    } else {
      // scan the set
      fputc('{', fp);
      for (setnode_t *node = set->head; node != NULL; node = node->next) {
	// print the current node
	if (itemprint != NULL)            // print the node
	  (*itemprint)(fp, node->key, node->item); 
      }
      fputc('}', fp);
    }
  }
}

/**************** set_iterate() ****************/
void 
set_iterate(set_t *set, void *arg,
	    void (*itemfunc)(void *arg, const char *key, void *item) )
{
  if (set != NULL && itemfunc != NULL) {
    // call itemfunc with arg, on each item
    for (setnode_t *node = set->head; node != NULL; node = node->next) {
      (*itemfunc)(arg, node->key, node->item); 
    }
  }
}

/**************** set_delete() ****************/
void 
set_delete(set_t *set, void (*itemdelete)(void *item) )
{
  if (set == NULL) {
    return; // bad set
  } else {
    setnode_t *node = set->head;
    while (node != NULL) {
      if (itemdelete != NULL) {	         // if necesssary...
        (*itemdelete)(node->item);	 // delete node's item
      }
      setnode_t *next = node->next;	 // remember what's next
      count_free(node->key);		 // delete current node's key
      count_free(node);			 // delete current node
      node = next;			 // move on to next
    }
    // delete the overall structure
    count_free(set);
  }
#ifdef MEMTEST
  count_report(stdout, "End of set_delete");
#endif
}
