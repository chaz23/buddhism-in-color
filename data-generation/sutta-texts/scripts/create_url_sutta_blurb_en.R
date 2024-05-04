# Script to create the file "./src/data/urls/blurb_en.json".
# A lookup table to map a blurb to the URL holding its content.

library(stringr)
library(purrr)
library(gh)
library(jsonlite)
library(dplyr)
library(readr)

# Check Github API calls remaining.
rate <- gh("GET /rate_limit")
calls_remaining <- rate$rate$limit - rate$rate$used
if (calls_remaining < 72) stop("API calls insufficient.")

blurb_list <- "/repos/suttacentral/bilara-data/contents/root/en/blurb/"

resp <- map(paste0("GET ", blurb_list), gh)

raw_content_url <- function (resp) {
  lapply(resp, function (x) {
    if (is.null(x$download_url)) {
      raw_content_url(gh(x$url)) 
    } else {
      x$download_url
    }
  })
}

download_urls <- unlist(lapply(resp, raw_content_url))

output <- tibble(url = download_urls) %>% 
  mutate(collection = str_remove(url, "^.*(?=/)/")) %>% 
  mutate(collection = str_remove(collection, "(?=-blurb).*$")) %>% 
  toJSON(pretty = TRUE)

write(output, "./projects/sutta-texts/data/url_sutta_blurb_en.json")
