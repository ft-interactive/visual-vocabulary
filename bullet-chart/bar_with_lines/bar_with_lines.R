setwd("~/Projects/Bar_with_lines/bar_with_lines")


data <- read.csv('data.csv') %>% as.data.frame %>%
  select(1:3) %>% rename(line=group2,bar=group1) %>%
  mutate(line=line %>% abs,
         bar=bar %>% abs)


write.csv(data,'data2.csv',quote=F,row.names = F)
