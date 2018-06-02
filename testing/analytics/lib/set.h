/* 
 * set.h - header file for CS50 set module
 *
 * A *set* maintains an unordered collection of (key,item) pairs;
 * any given key can only occur in the set once. It starts out empty 
 * and grows as the caller inserts new (key,item) pairs.  The caller 
 * can retrieve items by asking for their key, but cannot remove or 
 * update pairs.  Items are distinguished by their key.
 *
 * David Kotz, April 2016, 2017
 * updated by Xia Zhou, July 2016
 */

#ifndef __SET_H
#define __SET_H

#include <stdio.h>
#include <stdbool.h>

/**************** global types ****************/
typedef struct set set_t;  // opaque to users of the module

/**************** functions ****************/

/* Create a new (empty) set; return NULL if error. */
set_t *set_new(void);

/* Insert item, identified by a key (string), into the given set.
 * The key string is copied for use by the set; that is, the module
 * is responsible for allocating memory for a copy of the key string, and
 * later deallocating that memory; thus, the caller is free to re-use or 
 * deallocate its key string after this call.  
 * Return false if key exists, any parameter is NULL, or error;
 * return true iff new item was inserted.
 */
bool set_insert(set_t *set, const char *key, void *item);

/* Return the item associated with the given key;
 * return NULL if set is NULL, key is NULL, or key is not found.
 */
void *set_find(set_t *set, const char *key);

/* Print the whole set; provide the output file and func to print each item.
 * Ignore if NULL fp. Print (null) if NULL set.
 * Print a set with no items if NULL itemprint. 
*/
void set_print(set_t *set, FILE *fp, 
	       void (*itemprint)(FILE *fp, const char *key, void *item) );

/* Iterate over all items in the set, in undefined order.
 * Call the given function on each item, with (arg, key, item).
 * If set==NULL or itemfunc==NULL, do nothing.
 */
void set_iterate(set_t *set, void *arg,
		 void (*itemfunc)(void *arg, const char *key, void *item) );

/* Delete the whole set; ignore NULL set.
 * Provide a function that will delete each item (may be NULL).
 */
void set_delete(set_t *set, void (*itemdelete)(void *item) );

#endif // __SET_H
