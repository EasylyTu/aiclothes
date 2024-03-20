from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from io import BytesIO
import webuiapi

app = Flask(__name__)
CORS(app)  # 在应用上启用 CORS

# 加载本地的模型和tokenizer
model_path = "G:\chatGLM\ChatGLM3_Package\models\THUDM_chatglm3-6b"
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True).half().cuda()
model.eval()

def generate_text_with_chatglm3(prompt):
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.cuda()  # 使用 GPU
    max_length = len(input_ids[0]) + 500  # 假设生成的长度不超过原始长度+500
    output_ids = model.generate(input_ids, max_length=max_length)
    generated_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return generated_text

@app.route('/generate-text-description', methods=['POST'])
def generate_text_description():
    data = request.json
    original_input = data.get('original_input')
    # 生成文本描述
    text_desc = generate_text_with_chatglm3(original_input + ' 请据此仅向我推荐一件相关服饰。你只需告知颜色和款式。你的回答格式有且只有：根据您提供的信息，将为您设计XXX(描述性的非形容词短语)的XXX服饰。并只加上该种服饰的一段式的英文，不要翻译其他内容，')
    text_desc2 = generate_text_with_chatglm3(text_desc + ' 请仅用英文单词或词组回复我这件服装是什么以及其特点。请仅用英文单词或词组回复我！不要输出中文，直接说内容！仅用英文单词或词组回复我！')
    print(text_desc)
    print(text_desc2)
    return jsonify({'text_desc2': text_desc2})

@app.route('/generate-clothing-image', methods=['POST'])
def generate_clothing_image():
    data = request.json
    text_desc2 = data.get('text_desc2')
    image_quality = data.get('image_quality')
    if(image_quality == "ultra-hd"):
        quality = 2048
    elif(image_quality == "hd"):
        quality = 1024
    else:
        quality = 512

    # 调用 webuiapi 函数生成服装图片
    api = webuiapi.WebUIApi()
    result = api.txt2img(prompt='<lora:clothV1:0.55>' + text_desc2 + 'extremely detailed,masterpiece, best quality',
                         negative_prompt="shabby,simple,ugly,uncoordinated,outdated,weird,unbecoming,obsolete,shoddy,illogical",
                         styles=["anime"],
                         cfg_scale=7,
                         sampler_index='Euler',
                         steps=40,
                         enable_hr=True,
                         hr_scale=2,
                         hr_upscaler=webuiapi.HiResUpscaler.Latent,
                         hr_second_pass_steps=20,
                         hr_resize_x=quality,
                         hr_resize_y=quality,
                         denoising_strength=0.4)

    # 将生成的图片保存到内存中，并以bytes形式返回
    with BytesIO() as f:
        result.image.save(f, format='PNG')
        f.seek(0)
        image_data = f.read()

    return image_data, 200, {'Content-Type': 'image/png'}

if __name__ == '__main__':
    app.run(debug=False)
