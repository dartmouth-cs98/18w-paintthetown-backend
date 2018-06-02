/* =========================================================================
 * jhash.h - Jenkins' Hash, maps from string to integer
 *
 * ========================================================================= 
 */

#ifndef JHASH_H
#define JHASH_H

/*
 * jenkins_hash - Bob Jenkins' one_at_a_time hash function
 * @str: char buffer to hash
 * @mod: desired hash modulus
 *
 * Returns hash(str) % mod. Depends on str being null terminated.
 * Implementation details can be found at:
 *     http://www.burtleburtle.net/bob/hash/doobs.html
 */
unsigned long JenkinsHash(const char *str, unsigned long mod);

#endif // JHASH_H
