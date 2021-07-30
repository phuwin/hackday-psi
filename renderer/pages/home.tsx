import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Button, MenuItem, TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import CircularProgressWithLabel from '../components/CircularProgressWithLabel';
import ResultCard, { Result } from '../components/ResultCard';
import axios from 'axios';
import { getItem, setItem } from '../lib/localStorage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(4),
    },
    button: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    }
  })
);

const getData = async (index, url, times, results, setProgress, callback) => {
  try {
    setProgress(`${index}/${times}`);
    const { data } = await axios.get(url);
    results.push(data);
    if (index+1 !== times) getData(index+1, url, times, results, setProgress, callback);
    else callback(results);
  } catch(e) {
    if (e.response && e.response.status === 429) {
      setTimeout(()=>{getData(index, url, times, results, setProgress, callback);}, 1000);
    }
  }
}

const getRawResults : (String, Number, Function) => Promise<[]> = (url, times, setProgress) => new Promise((resolve)=>{
  getData(0, url, times, [], setProgress, resolve);
});

const getResult : ([]) => Result = (results) => {
  const info = results.reduce((acc, result)=>{
    const score = Number(result.lighthouseResult.categories.performance.score * 100);
    acc.sum += score;
    acc.results.push(score);
    return acc;
  }, { sum:0, results: []});
  let url = results[0].id.replace('https://','').replace('http://', '');
  if (url.length > 50) url = `${url.substring(0,20)}...${url.substring(url.length - 20,url.length-1)}`
  return {
    results: info.results.join(", "),
    avg: (info.sum/results.length).toFixed(2),
    max: Math.max(...info.results).toFixed(2),
    min: Math.min(...info.results).toFixed(2),
    times: results.length,
    createdAt: new Date(),
    url,
  };
}

function Home() {
  const {root, button} = useStyles({});
  const [isRunning, setIsRunning] = useState(false);
  const [times, setTimes] = useState(2);
  const [platform, setPlatform] = useState('mobile');
  const [url, setUrl] = useState('https://www.seiska.fi/kotimaa/toinen-lapsi-jukka-hilden-ja-chachi-rakas-saivat-odotetun-tyttovauvan/1161411');
  const timesSet = [2,5,7,10];
  const platforms = ['mobile', 'desktop'];
  const [results, setResults] = useState<Result[]|[]>([]);
  const [progress, setProgress] = useState('');
  useEffect(()=>{
    setResults(getItem('lhResults') || []);
    setUrl(getItem('lhUrl')|| '');
    setTimes(Number(getItem('lhTimes'))|| 2);
    setPlatform(getItem('lhPlatform')|| 'mobile');
  }, [])
  const onSelectChange = (event) => {
    setTimes(event.target.value);
    setItem('lhTimes', event.target.value);
  }
  const onPlatformChange = (event) => {
    setPlatform(event.target.value);
    setItem('lhPlatform', event.target.value);
  }
  const onInputChange = (event) => {
    setUrl(event.target.value);
    setItem('lhUrl', event.target.value);
  }
  const run = async () => {
    if (url) {
      setIsRunning(true);
      const requestUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&strategy=${platform}`
      const rawResults = await getRawResults(requestUrl, times, setProgress);
      const result = getResult(rawResults);
      const newResults = [result, ...results];
      setResults(newResults);
      setItem('lhResults', newResults);
      setIsRunning(false);
    }
  }

  const removeResult = (index) => {
    results.splice(index,1);
    setResults(results);
    setItem('lhResults', results);
  }
  return (
    <React.Fragment>
      <Head>
        <title>Pagespeed Insights</title>
      </Head>
      <div className={root}>
        <Typography variant="h4" gutterBottom align="center">
          Pagespeed Insights
        </Typography>
        <Typography align="center">
          <img src="/images/pagespeed.png" /> 
        </Typography>
        <form noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField value={url} onChange={onInputChange} fullWidth id="url" label="url" variant="outlined" />
            </Grid>
            <Grid item xs={2}>
              <TextField variant="outlined" select fullWidth label="platform" value={platform} onChange={onPlatformChange}>
                {platforms.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
            </Grid>  
            <Grid item xs={2}>
              <TextField variant="outlined" select fullWidth label="times run" value={times} onChange={onSelectChange}>
                {timesSet.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <Button className={button} fullWidth variant="contained" color="primary" disabled={isRunning} onClick={run}>
            {isRunning ? <CircularProgressWithLabel progress={progress} size={24} color="secondary" /> : 'Run' }
          </Button>
        </form>
        <Grid container spacing={2}>
          {results.length > 0 && results.map((result, index)=>
            <Grid key={index} item xs={12}>
              <ResultCard {...result} onRemoveClick={()=>{removeResult(index)}}/>
            </Grid>
          )}
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default Home;
