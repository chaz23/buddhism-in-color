library(dplyr)
library(arrow)

load(url("https://github.com/chaz23/sutta-science/raw/main/data/text-embeddings/embeddings_by_section.Rda"))

temp_file <- tempfile(fileext = ".parquet")

write_parquet(embeddings_by_section, sink = temp_file)

system2("cat", args = temp_file)