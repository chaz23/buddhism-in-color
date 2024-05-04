# Sutta Characters

## Overview

The goal of this project is to enable users to build a deeper connection with the characters they are reading about in the suttas.  

In terms of UI / UX, this might lead to users being able to:  

- Click on a characters name in a sutta and read about them.  
- View / navigate to other suttas where a particular character is mentioned.  
- Read commentarial / mythological narrative about characters.  
- Highlight suttas that characters appeared in within network graphs, thereby surfacing interesting patterns.

## Data Generation Process

- Start off with the original Pali to English dictionary of proper names, downloaded [here](https://raw.githubusercontent.com/suttacentral/sc-data/master/dictionaries/complex/en/pli2en_dppn.json), renamed `pli2en_dppn_original.json` and located in the `data` directory.  
- Run the script `compile_persons_from_dppn.R` in the `scripts` directory to convert the data to a "tidier" representation of an id-per-row format.  
- Output will be `data/pli2en_dppn_tidied.json`.  
- A copy of this file will be made, named `data/pli2en_dppn_updated.json`. Any additions / corrections will be then made by hand to this new file, so that accidental overwrites (eg: by running `compile_persons_from_dppn.R`) do not erase manual corrections.