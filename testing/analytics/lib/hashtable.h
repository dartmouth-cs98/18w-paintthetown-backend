/* 
 * hashtable.h - header file for CS50 hashtable module
 *
 * A *hashtable* is a set of (key,item) pairs.  It acts just like a set, 
 * but is far more efficient for large collections.
 *
 * David Kotz, April 2016, 2017
 * updated by Xia Zhou, July 2016
 */

#ifndef __HASHTABLE_H
#define __HASHTABLE_H

#include <stdio.h>
#include <stdbool.h>

/**************** global types ****************/
typedef struct hashtable hashtable_t;  // opaque to users of the module

/**************** functions ****************/

/* Create a new (empty) hashtable; return NULL if error. */
hashtable_t *hashtable_new(const int num_slots);

/* Insert item, identified by key (string), into the given hashtable.
 * The key string is copied for use by the hashtable; that is, the module
 * is responsible for allocating memory for a copy of the key string, and
 * later deallocating that memory; thus, the caller is free to re-use or 
 * deallocate its key string after this call.  
 * Return false if key exists in ht, any parameter is NULL, or error;
 * return true iff new item was inserted.
 */
bool hashtable_insert(hashtable_t *ht, const char *key, void *item);

/* Return the item associated with the given key;
 * return NULL if hashtable is NULL, key is NULL, key is not found.
 */
void *hashtable_find(hashtable_t *ht, const char *key);

/* Print the whole table; provide the output file and func to print each item.
 * Ignore if NULL fp. Print (null) if NULL ht. 
 * Print a table with no items if NULL itemprint.
 */
void hashtable_print(hashtable_t *ht, FILE *fp, 
		     void (*itemprint)(FILE *fp, const char *key, void *item));

/* Iterate over all items in the table; in undefined order.
 * Call the given function on each item, with (arg, key, item).
 * If ht==NULL or itemfunc==NULL, do nothing.
 */
void hashtable_iterate(hashtable_t *ht, void *arg,
	       void (*itemfunc)(void *arg, const char *key, void *item) );

/* Delete the whole hashtable; ignore NULL ht.
 * Provide a function that will delete each item (may be NULL).
 */
void hashtable_delete(hashtable_t *ht, void (*itemdelete)(void *item) );

#endif // __HASHTABLE_H
