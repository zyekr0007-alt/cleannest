// Subject labels are mapped per photograph, not guessed from the filename: the
// original filenames group most of the gallery under "bathroom", including shots
// that show a car seat, a sofa and an outdoor terrace. No locality, date, customer
// or job-history attribution is inferred — only what is visible in the frame.
const RESULT_CONTEXT={
 'before-after-01-bathroom-shower':['Shower tiles','bathroom-cleaning'],
 'before-after-02-bathroom':['Bathroom tiles','bathroom-cleaning'],
 'before-after-03-floor':['Floor tiles','floor-renewal'],
 'before-after-04-post-construction':['Showroom floor','post-construction-cleaning'],
 'before-after-05-bathroom-11':['Marble floor','floor-renewal'],
 'before-after-06-bathroom-12':['Bathroom and WC','bathroom-cleaning'],
 'before-after-07-bathroom-13':['Bathroom tiles','bathroom-cleaning'],
 'before-after-08-bathroom-14':['Car seat upholstery','sofa-cleaning'],
 'before-after-09-bathroom-15':['Bathroom wall tiles','bathroom-cleaning'],
 'before-after-10-bathroom-16':['Bathroom wall tiles','bathroom-cleaning'],
 'before-after-11-bathroom-17':['Pedestal basin','bathroom-cleaning'],
 'before-after-12-bathroom-18':['Basin and vanity','bathroom-cleaning'],
 'before-after-13-bathroom-19':['Patterned wall tiles','bathroom-cleaning'],
 'before-after-14-bathroom-20':['Car seat upholstery','sofa-cleaning'],
 'before-after-15-bathroom-21':['Wall and marble floor','bathroom-cleaning'],
 'before-after-16-bathroom-23':['Marble floor','floor-renewal'],
 'before-after-17-bathroom-24':['Bathroom floor','bathroom-cleaning'],
 'before-after-18-bathroom-25':['Washbasin','bathroom-cleaning'],
 'before-after-19-bathroom-26':['Velvet sofa','sofa-cleaning'],
 'before-after-20-bathroom-27':['Tiled wall and pipes','bathroom-cleaning'],
 'before-after-21-bathroom-28':['Granite floor','floor-renewal'],
 'before-after-22-bathroom-04':['Balcony floor','balcony-cleaning'],
 'before-after-23-bathroom-05':['Terrace floor','balcony-cleaning'],
 'before-after-24-bathroom-06':['Bathroom and WC','bathroom-cleaning'],
 'before-after-25-bathroom-07':['Switchboard',''],
 'before-after-26-bathroom-08':['Patterned tiles','bathroom-cleaning'],
 'before-after-27-bathroom-09':['Vanity and basin','bathroom-cleaning'],
 'before-after-28-single':['Sofa fabric','sofa-cleaning'],
 'before-after-29-single-3':['Chair cushions','sofa-cleaning'],
};
const resultKey=file=>String(file).replace(/\.(webp|png|jpe?g)$/i,'').replace(/^\.?\//,'').split('/').pop();
export function resultContext(file){
 const found=RESULT_CONTEXT[resultKey(file)];
 return found?{subject:found[0],service:found[1]||null}:{subject:'Cleaning result',service:null};
}

// Ranked order for the galleries. Every file below was viewed frame by frame rather
// than inferred from its name — the filenames group a sofa, two car seats, a
// switchboard and an outdoor terrace under "bathroom". The head of the list is the
// owner's order: wall tiles, then a basin, then the sofa. After that it runs
// strongest-transformation first, alternating room types so no two near-identical
// frames sit side by side. The homepage takes the first ten.
export const RESULT_PRIORITY=['before-after-10-bathroom-16','before-after-12-bathroom-18','before-after-19-bathroom-26','before-after-16-bathroom-23','before-after-21-bathroom-28','before-after-14-bathroom-20','before-after-01-bathroom-shower','before-after-17-bathroom-24','before-after-13-bathroom-19','before-after-03-floor','before-after-09-bathroom-15','before-after-08-bathroom-14','before-after-05-bathroom-11','before-after-20-bathroom-27','before-after-26-bathroom-08','before-after-27-bathroom-09','before-after-15-bathroom-21','before-after-07-bathroom-13','before-after-02-bathroom','before-after-11-bathroom-17','before-after-24-bathroom-06','before-after-06-bathroom-12','before-after-18-bathroom-25','before-after-04-post-construction','before-after-22-bathroom-04','before-after-23-bathroom-05','before-after-25-bathroom-07'];
// Neither of these is a before/after pair, so neither belongs on a page headed
// "Real before and after". before-after-28-single is one photograph with a cleaned
// stripe down the middle; before-after-29-single-3 shows two different cushions.
const NOT_A_PAIR=new Set(['before-after-28-single','before-after-29-single-3']);
export const isResultPair=base=>!NOT_A_PAIR.has(base);
export function orderResults(bases){
 const listed=bases.filter(isResultPair);
 return [...RESULT_PRIORITY.filter(b=>listed.includes(b)),...listed.filter(b=>!RESULT_PRIORITY.includes(b)).sort()];
}
