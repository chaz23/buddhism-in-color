# Script to create the file "./src/data/urls/sutta_html.json".
# A lookup table to map a sutta to the URL holding its HTML content.

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

html_list_root <- "/repos/suttacentral/bilara-data/contents/html/pli/ms/sutta/"

nikayas <- c("dn", "mn", "sn", "an", "kn")

html_list <- unlist(map(html_list_root, paste0, nikayas))

resp <- map(paste0("GET ", html_list), gh)
names(resp) <- nikayas

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
  mutate(html = str_remove(url, "^.*(?=/)/")) %>% 
  mutate(html = str_remove(html, "(?=_html).*$")) %>% 
  toJSON(pretty = TRUE)

write(output, "./src/data/urls/sutta_html.json")
