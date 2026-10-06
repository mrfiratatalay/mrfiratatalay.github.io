package com.learningspringboot4;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {

    private List<Video> videos = List.of(
            new Video("ASKIM BENIM"),
            new Video("HERSEYIMSINNN"),
            new Video("BIR AN ONCE IYILES TOMBISIMMM.")
    );

    public List<Video> getVideos() {
        return  videos;
    }





}
