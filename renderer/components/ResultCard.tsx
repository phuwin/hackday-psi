import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';

export interface Result {
  url: String,
  avg: String | Number,
  max: String | Number,
  min: String | Number,
  results: String,
  times: Number,
  createdAt: Date,
  onRemoveClick?: Function,
}

const useStyles = makeStyles({
  title: {
    fontSize: 12,
  },
});

const ResultCard = ({results, avg, max, min, url, times, createdAt, onRemoveClick}:Result) =>{
  const {title} = useStyles({});
  return <Card>
    <CardContent>
      <Grid container>
        <Grid item xs={8}>
        <Typography gutterBottom className={title} color="textSecondary">
          {url}
        </Typography>
        </Grid>
        <Grid item xs>
        <Typography align="right" gutterBottom className={title} color="textSecondary">
          {new Date(createdAt).toLocaleString()}
        </Typography>
        </Grid>
      </Grid>
      <Typography>
        Average: <b>{avg}</b>, Max: <b>{max}</b>, Min: <b>{min}</b> ({times} times)
      </Typography>
      <Typography>
        Detailed results: {results}
      </Typography>
    </CardContent>
    <CardActions>
      <Button onClick={()=>{onRemoveClick()}}> Remove</Button>
    </CardActions>
  </Card>
}

export default ResultCard;