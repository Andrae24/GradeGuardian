package com.example.gradeguardian_backend.features.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public String uploadFile(MultipartFile file, String email) throws Exception {
        // The name of the bucket you created in Supabase
        String bucketName = "avatars"; 
        
        // Create a unique filename using the user's email and a timestamp
        String cleanEmail = email.replaceAll("[^a-zA-Z0-9]", "_");
        String fileName = cleanEmail + "_" + System.currentTimeMillis() + ".jpg";
        
        // Supabase REST API endpoint for uploading files
        String endpoint = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        RestTemplate restTemplate = new RestTemplate();
        
        // Setup the headers with your Supabase Key and the file type
        HttpHeaders headers = new HttpHeaders();
        
        // 1. The Bearer Token
        headers.setBearerAuth(supabaseKey);
        
        // 2. THE FIX: Supabase also strictly requires the 'apikey' header for storage
        headers.set("apikey", supabaseKey); 
        
        // 3. The Content Type (letting Supabase know it's an image)
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));

        // Push the file bytes to Supabase
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
        ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            // If successful, construct and return the public URL so Glide can read it
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
        } else {
            throw new Exception("Failed to upload to Supabase Storage");
        }
    }
}