import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Fab, Input } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { StoreState } from '../../store/store';
import { fetchJobs, locationSort } from '../../store/job/jobActions';
import { JobAttributes } from '../../store/job/jobInterface';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import JobCard from './jobCard';

const useStyles = makeStyles({
  formControl: {
    margin: '0 1em 1em 1em',
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: '1em',
  },
  button: {
    '&.active': {
      background: '#04e762',
      color: '#fffff',
    },
    color: '#04e762',
    margin: '10px 5px',
    background: '#ffffff',
  },
  search: {
    margin: '0 1em',
    width: '300px',
  },
  createButton: {
    color: '#ffffff',
    backgroundColor: '#04e762',
  },
});

const Feed: React.FC = () => {
  const dispatch = useDispatch();
  const { jobs } = useSelector((state: StoreState) => state.job);
  const { count } = useSelector((state: StoreState) => state.job);
  const [type, setType] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [location, setLocation] = useState(null);
  const [locSort, setLocSort] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, []);
  const handleInput = (e: {
    target: { value: React.SetStateAction<string> };
  }) => setInput(e.target.value);

  const handleType = (e: React.ChangeEvent<{ value: string }>) => {
    const filter: string = e.target.value;
    setType(filter);
    setPage(1);
    setSize(20);
    dispatch(fetchJobs(input, page, size, filter === 'all' ? '' : filter));
  };
  const fetchNext = () => {
    setSize(size + 20);
    dispatch(fetchJobs(input, page, size, type));
  };
  useEffect(() => {
    const success = ({ coords }) => {
      const localCoord = {
        lat: coords.latitude,
        lng: coords.longitude,
      };
      setLocation(localCoord);
    };
    navigator.geolocation.getCurrentPosition(success);
  }, []);

  const sortByLocation = () => {
    setLocSort(!locSort);
    dispatch(locationSort(jobs, location, !locSort));
  };

  const classes = useStyles();
  return (
    <div className="container">
      <div className="feedContainer">
        {location ? (
          <div className="sortByLocation">
            <FormControlLabel
              label="Show jobs near me"
              control={
                <Switch
                  checked={locSort}
                  onChange={sortByLocation}
                  name="sortByLocation"
                  color="primary"
                />
              }
            />
          </div>
        ) : null}
        <div className="jobSearch">
          <div className="feedButtons">
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-label">Job Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={type}
                onChange={handleType}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="funded">Paid</MenuItem>
                <MenuItem value="volunteer">Volunteer</MenuItem>
              </Select>
            </FormControl>
          </div>
          <Input
            className={classes.search}
            value={input}
            onChange={handleInput}
            fullWidth
            placeholder="Search"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            onKeyPress={e => {
              if (e.key === 'Enter') {
                setPage(1);
                setSize(20);
                dispatch(fetchJobs(input, page, size, type));
              }
            }}
          />
        </div>

        <InfiniteScroll
          dataLength={count}
          next={fetchNext}
          hasMore={size < count}
          loader={<h4>Loading...</h4>}
        >
          {jobs.length ? (
            jobs.map((job: JobAttributes) => <JobCard key={job.id} job={job} />)
          ) : (
            <h2> No Jobs Yet</h2>
          )}
        </InfiniteScroll>
      </div>
      <div className="createButtonContainer">
        <Link to="/create">
          <Fab className={classes.createButton}>
            <AddIcon />
          </Fab>
        </Link>
      </div>
    </div>
  );
};

export default Feed;
