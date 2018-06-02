/* =========================================================================
 * jhash.c - Jenkins' Hash, maps from string to integer
 *
 * ========================================================================= 
 */

#include <string.h>
#include "jhash.h" 

// JenkinsHash - see header file for usage
unsigned long
JenkinsHash(const char *str, unsigned long mod)
{
  if (str == NULL)
    return 0;

  size_t len = strlen(str);
  unsigned long hash, i;

  for (hash = i = 0; i < len; ++i)
    {
      hash += str[i];
      hash += (hash << 10);
      hash ^= (hash >> 6);
    }

  hash += (hash << 3);
  hash ^= (hash >> 11);
  hash += (hash << 15);

  return hash % mod;
}
