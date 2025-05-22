library(dplyr)
library(arrow)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/sutta-hierarchy/sutta_hierarchy.Rda"
  )
)

temp_file <- tempfile(fileext = ".parquet")

write_parquet(sutta_hierarchy, sink = temp_file)

system2("cat", args = temp_file)