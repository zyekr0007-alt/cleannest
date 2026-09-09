// Only subject labels supported by the existing original filenames.
// No locality, date, customer or job-history attribution is inferred.
export function resultContext(file){
 if(file.includes('bathroom'))return {subject:'Bathroom cleaning',service:'bathroom-cleaning'};
 if(file.includes('post-construction'))return {subject:'Post-construction cleaning',service:'post-construction-cleaning'};
 if(file.includes('-floor'))return {subject:'Floor cleaning',service:'floor-renewal'};
 return {subject:'Cleaning result',service:null};
}
