import TYPES from '../types';
import { AppThunk } from '../thunkType';
import Axios from 'axios';
import { booleanType } from 'aws-sdk/clients/iam';
import { JobAttributes, UserJobs } from './jobInterface';
import {
  dateSort,
  locationSorter,
} from '../../components/mapComponent/mapUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from '../../socket';

toast.configure();

interface Jobs {
  type: string;
  count?: number;
  jobs?: Array<JobAttributes>;
  job?: JobAttributes;
  userJobs?: UserJobs;
}
const setJobs = (count: number, jobs: Array<JobAttributes>): Jobs => ({
  type: TYPES.SET_JOBS,
  count,
  jobs,
});

const setJob = (job: JobAttributes): Jobs => ({
  type: TYPES.SET_JOB,
  job,
});

const setUserJobs = (userJobs: UserJobs): Jobs => ({
  type: TYPES.SET_USER_JOBS,
  userJobs,
});

const fetchJobs = (filter = '', page = 1, size = 20, type = ''): AppThunk => {
  return async dispatch => {
    let count;
    let rows;
    const data = (
      await Axios.get(
        `/api/jobs/?filter=${filter}&page=${page}&size=${size}&type=${type}`
      )
    ).data;
    if (data) {
      count = data.count;
      rows = data.rows;
    } else {
      count = 0;
      rows = [];
    }
    dispatch(setJobs(count, rows));
  };
};

const fetchMapJobs = (
  north: number,
  south: number,
  east: number,
  west: number,
  filter: string
): AppThunk => {
  return async dispatch => {
    const { data } = await Axios.get(
      `/api/jobs/map/?north=${north}&south=${south}&east=${east}&west=${west}&filter=${filter}`
    );
    dispatch(setJobs(0, data));
  };
};

const fetchJob = (id: string): AppThunk => {
  return async (dispatch): Promise<any> => {
    const { data } = await Axios.get(`/api/jobs/job/${id}`);
    dispatch(setJob(data));
    return data;
  };
};

export const fetchJobsByUser = (userId: string): AppThunk => {
  return async (dispatch): Promise<any> => {
    try {
      const jobs = (await Axios.get(`/api/jobs/user/${userId}`)).data;
      dispatch(setUserJobs(jobs));
    } catch (e) {
      console.error(e);
    }
  };
};

const reserveJob = (jobId: string): AppThunk => {
  return async (dispatch): Promise<any> => {
    try {
      const { data } = await Axios.put(`/api/jobs/${jobId}`, {
        type: 'reserve',
      });
      if (data.status) {
        dispatch(setJob(data.job));
        return data.job;
      }
    } catch (e) {
      if (e.response.data.shouldUpdateStore) {
        dispatch(setJob(e.response.data.job));
      }
      throw e.response.data.message;
    }
  };
};

const unreserveJob = (jobId: string): AppThunk => {
  return async (dispatch): Promise<any> => {
    try {
      const { data } = await Axios.put(`/api/jobs/${jobId}`, {
        type: 'unreserve',
      });
      if (data.status) dispatch(setJob(data.job));
      return data.job;
    } catch (e) {
      if (e.response.data.shouldUpdateStore) {
        dispatch(setJob(e.response.data.job));
      }
      console.log(e.response.data.message);
    }
  };
};

export const cancelJob = (job: JobAttributes): AppThunk => {
  return async (dispatch): Promise<any> => {
    try {
      const { data } = await Axios.put(`/api/payment/stripe/cancel/${job.id}`);
      if (data) {
        toast('You have successfully cancelled this job', { type: 'success' });
      } else toast('There was an error cancelling this job', { type: 'error' });
      dispatch(fetchJobsByUser(job.userId));
    } catch (e) {
      toast('There was an error cancelling this job', { type: 'error' });
    }
  };
};
export const completeJob = (job: JobAttributes): AppThunk => {
  return async (dispatch): Promise<any> => {
    try {
      const { data } = await Axios.put(
        `/api/payment/stripe/complete/${job.id}`
      );
      if (data.status) {
        toast('You have successfully completed this job', { type: 'success' });
        socket.emit('complete', job);
        dispatch(fetchJobsByUser(job.userId));
      } else {
        toast(data.stripeError, { type: 'error' });
        socket.emit('stripeError', {
          job,
          stripeError: data.stripeError,
        });
      }
    } catch (e) {
      toast('There was an error completing this job', { type: 'error' });
    }
  };
};
interface Location {
  lat: number;
  lng: number;
}

const locationSort = (
  jobs: JobAttributes[],
  location: Location,
  sort: booleanType
): AppThunk => {
  return dispatch => {
    if (sort === true) {
      dispatch({
        type: TYPES.LOCATION_SORT,
        jobs: locationSorter(jobs, location),
      });
    } else {
      dispatch({
        type: TYPES.LOCATION_SORT,
        jobs: dateSort(jobs),
      });
    }
  };
};

const addPhotoToJob = (id: string, file: FormData): AppThunk => {
  return async dispatch => {
    Axios.post(`/api/photo/jobphoto/${id}`, file, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=boundary',
      },
    })
      .then(({ data }) => {
        dispatch(setJob(data));
      })
      .catch(console.log);
  };
};

const deletePhotoFromJob = (photoId: string, jobId: string): AppThunk => {
  return async dispatch => {
    Axios.delete(`/api/jobs/${photoId}?jobId=${jobId}`)
      .then(({ data }) => dispatch(setJob(data)))
      .catch(console.log);
  };
};

export {
  setJob,
  setJobs,
  fetchJobs,
  reserveJob,
  fetchJob,
  unreserveJob,
  locationSort,
  fetchMapJobs,
  addPhotoToJob,
  deletePhotoFromJob,
};
