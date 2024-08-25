from dotenv import load_dotenv
load_dotenv()
import os
from pinecone import Pinecone, ServerlessSpec
import google.generativeai as genai


pc = Pinecone(api_key= os.getenv("PINECONE_API_KEY"))
pc.create_index(
    name="rag",
    dimension=768,
    metric="cosine",
    spec=ServerlessSpec(cloud='aws', region='us-east-1')
)

import json
data = json.load(open('reviews.json'))
data['reviews']


genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
processed_data=[]
for review in data['reviews']:
    response = genai.embed_content(
        content=['review'],
        model='models/text-embedding-004',
        task_type='retrievAl_document',
        title='Embedding Reviews'
    )
    embedding = response['embedding']
    processed_data.append({
        'values': embedding,
        'id':review['professor'],
        'metadata':{
            'review': review['review'],
            'subject': review['subject'],
            'stars': review['stars']
            }
    })


def flatten_and_convert_to_floats(nested_list):
    """Flattens a nested list and converts all elements to floats."""
    flattened_list = []
    for item in nested_list:
        if isinstance(item, list):  # Check if the item is a list
            flattened_list.extend(flatten_and_convert_to_floats(item))  # Recursively flatten
        else:
            flattened_list.append(float(item))  # Convert to float and add to list
    return flattened_list

for item in processed_data:
    if isinstance(item['values'], list):
        try:
            item['values'] = flatten_and_convert_to_floats(item['values'])
        except ValueError as e:
            raise TypeError(f"Failed to convert values to floats: {e}")
    else:
        raise TypeError("Values should be a list of floats")

processed_data[0]


index = pc.Index('rag')
index.upsert(
    vectors=processed_data,
    namespace='ns1'
)

index.describe_index_stats()